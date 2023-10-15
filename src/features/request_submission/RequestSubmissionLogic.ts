//
// RequestSubmissionLogic.ts
//
// Copyright (c) 2022 Hironori Ichimiya <hiron@hironytic.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

import { Logic } from "../../utils/LogicProvider"
import { BehaviorSubject, NEVER, Observable } from "rxjs"
import { RequestSubmissionRepository } from "./RequestSubmissionRepository"
import { delay } from "../../utils/Delay"
import { FunctionsError } from "@firebase/functions"
import { runDetached } from "../../utils/RunDetached"

export const PhaseTypes = {
  Nothing: "Nothing",
  Processing: "Processing",
  RequestKeyNeeded: "RequestKeyNeeded",
  Finished: "Finished",
  Error: "Error",
} as const

export interface NothingPhase {
  type: typeof PhaseTypes.Nothing,
} 

export interface ProcessingPhase {
  type: typeof PhaseTypes.Processing,
}

export interface RequestKeyNeededPhase {
  type: typeof PhaseTypes.RequestKeyNeeded,
  
  requestKeyValueChanged(value: string): void
  finish(proceed: boolean): void
  
  requestKey$: Observable<string>
}

export interface FinishedPhase {
  type: typeof PhaseTypes.Finished,
  
  closeDialog(): void
}

export interface ErrorPhase {
  type: typeof PhaseTypes.Error,
  message: string,

  closeDialog(): void
}

export type Phase = NothingPhase | ProcessingPhase | RequestKeyNeededPhase | FinishedPhase | ErrorPhase  

export interface RequestSubmissionLogic extends Logic {
  submitNewRequestFromSession(sessionId: string): void
  
  phase$: Observable<Phase>
}

export class NullRequestSubmissionLogic implements RequestSubmissionLogic {
  dispose() { /* do nothing */ }
  submitNewRequestFromSession(sessionId: string) { /* do nothing */ }
  
  phase$ = NEVER
}

export class AppRequestSubmissionLogic implements RequestSubmissionLogic {
  storedRequestKey: string | undefined = undefined
  phase$ = new BehaviorSubject<Phase>({ type: PhaseTypes.Nothing })
  
  constructor(private readonly repository: RequestSubmissionRepository) {
  }
  
  dispose() {
    this.storedRequestKey = undefined
  }
  
  submitNewRequestFromSession(sessionId: string) {
    runDetached(async () => {
      if (this.phase$.value.type !== PhaseTypes.Nothing) {
        console.error("Busy on request submission")
        return
      }

      let tryAgain = false
      let tryCount = 0
      do {
        tryAgain = false
        if (this.storedRequestKey === undefined) {
          const key = await this.askRequestKey()
          if (key === undefined) {
            break
          }
          this.storedRequestKey = key
        }

        this.phase$.next({ type: PhaseTypes.Processing })

        if (this.storedRequestKey === "") {
          this.storedRequestKey = undefined
          tryAgain = true
        } else {
          try {
            await this.repository.addRequestFromSession({
              requestKey: this.storedRequestKey,
              sessionId,
            })
            await this.showFinished()
          } catch (error) {
            const firebaseError = error as FunctionsError
            if ("invalid_request_key" === firebaseError.details) {
              this.storedRequestKey = undefined
              tryAgain = true
            } else {
              await this.showError("リクエストを処理できませんでした。")
            }
          }
        }
        tryCount++
        if (tryCount >= 3) {
          // forbid user to try another request code repeatably
          await delay(5000)
          tryCount = 0
        }
      } while (tryAgain)
      
      this.phase$.next({ type: PhaseTypes.Nothing })
    })
  }
  
  private askRequestKey(): Promise<string | undefined> {
    return new Promise(resolve => {
      let isResolved = false
      const requestKey$ = new BehaviorSubject<string>("")
      const requestKeyValueChanged = (value: string): void => {
        requestKey$.next(value)
      }
      const finish = (proceed: boolean): void => {
        if (!isResolved) {
          isResolved = true
          resolve(proceed ? requestKey$.value : undefined)
        }
      }
      this.phase$.next({
        type: PhaseTypes.RequestKeyNeeded,
        requestKey$,
        requestKeyValueChanged,
        finish,
      })
    })
  }
  
  private showFinished(): Promise<void> {
    return new Promise(resolve => {
      let isResolved = false
      this.phase$.next({
        type: PhaseTypes.Finished,
        closeDialog: () => {
          if (!isResolved) {
            isResolved = true
            resolve()
          }
        }
      })
    })
  }

  private showError(message: string): Promise<void> {
    return new Promise(resolve => {
      let isResolved = false
      this.phase$.next({
        type: PhaseTypes.Error,
        message,
        closeDialog: () => {
          if (!isResolved) {
            isResolved = true
            resolve()
          }
        }
      })
    })
  }
}
