//
// RequestSubmissionLogic.test.ts
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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { RequestSubmissionRepository } from "./RequestSubmissionRepository"
import { AddRequestFromSessionParams } from "../../entities/AddRequestFromSessionParams"
import { Subscription } from "rxjs"
import {
  AppRequestSubmissionLogic,
  ErrorPhase,
  Phase,
  PhaseTypes,
  RequestSubmissionLogic
} from "./RequestSubmissionLogic"
import { EventuallyObserver } from "../../utils/EventuallyObserver"

class MockRequestSubmissionRepository implements RequestSubmissionRepository {
  addRequestFromSession = vi.fn(async (_params: AddRequestFromSessionParams): Promise<void> => { /* do nothing */ })
}

class UIMediator {
  private subscription: Subscription | undefined
  private awaiterForRequestKeyNeededPhase: {
    resolve: () => void
    proceed: boolean
    key?: string
  } | undefined
  private awaiterForFinishedPhase: {
    resolve: () => void
  } | undefined
  private awaiterForErrorPhase: {
    resolve: () => void
  } | undefined
  private phase: Phase | undefined

  dispose() {
    this.subscription?.unsubscribe()
  }

  install(logic: RequestSubmissionLogic) {
    if (this.subscription !== undefined) {
      throw new Error("Already installed!")
    }

    this.subscription = logic.phase$.subscribe(phase => {
      this.phase = phase
      this.check()
    })
  }

  answerToRequestKey(proceed: boolean, key?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.awaiterForRequestKeyNeededPhase !== undefined) {
        reject("Already awaiting")
        return
      }

      this.awaiterForRequestKeyNeededPhase = {
        resolve,
        proceed,
        key,
      }
      this.check()
    })
  }

  answerToFinished(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.awaiterForFinishedPhase !== undefined) {
        reject("Already awaiting")
        return
      }

      this.awaiterForFinishedPhase = {
        resolve,
      }
      this.check()
    })
  }

  answerToError(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.awaiterForErrorPhase !== undefined) {
        reject("Already awaiting")
        return
      }

      this.awaiterForErrorPhase = {
        resolve,
      }
      this.check()
    })
  }

  private check() {
    if (this.phase === undefined) {
      return
    }

    if (this.phase.type === PhaseTypes.RequestKeyNeeded && this.awaiterForRequestKeyNeededPhase !== undefined) {
      if (this.awaiterForRequestKeyNeededPhase.key !== undefined) {
        this.phase.requestKeyValueChanged(this.awaiterForRequestKeyNeededPhase.key)
      }
      this.phase.finish(this.awaiterForRequestKeyNeededPhase.proceed)
      const resolve = this.awaiterForRequestKeyNeededPhase.resolve

      this.phase = undefined
      this.awaiterForRequestKeyNeededPhase = undefined

      resolve()
    } else if (this.phase.type === PhaseTypes.Finished && this.awaiterForFinishedPhase !== undefined) {
      this.phase.closeDialog()
      const resolve = this.awaiterForFinishedPhase.resolve

      this.phase = undefined
      this.awaiterForFinishedPhase = undefined

      resolve()
    } else if (this.phase.type === PhaseTypes.Error && this.awaiterForErrorPhase !== undefined) {
      this.phase.closeDialog()
      const resolve = this.awaiterForErrorPhase.resolve

      this.phase = undefined
      this.awaiterForErrorPhase = undefined

      resolve()
    }
  }
}

let mockRequestSubmissionRepository: MockRequestSubmissionRepository
let subscription: Subscription
let logic: RequestSubmissionLogic | undefined
let uiMediator: UIMediator | undefined

function createLogic(): RequestSubmissionLogic {
  logic = new AppRequestSubmissionLogic(mockRequestSubmissionRepository)
  return logic
}

beforeEach(() => {
  mockRequestSubmissionRepository = new MockRequestSubmissionRepository()
  subscription = new Subscription()
  logic = undefined
  uiMediator = undefined
})

afterEach(() => {
  subscription.unsubscribe()
  logic?.dispose()
  uiMediator?.dispose()
})

it("should start with 'Nothing' phase", async() => {
  const logic = createLogic()

  const observer = new EventuallyObserver<Phase>()
  const expectation = observer.expectValue(phase => {
    expect(phase.type).toBe(PhaseTypes.Nothing)
  })
  subscription.add(logic.phase$.subscribe(observer))
  await expectation
})

describe("new request from session", () => {
  it("should ask user to input request key", async () => {
    const logic = createLogic()

    const observer = new EventuallyObserver<Phase>()
    const expectation = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.RequestKeyNeeded)
    })
    subscription.add(logic.phase$.subscribe(observer))
    
    logic.submitNewRequestFromSession("s1")
    await expectation
  })
  
  it("should move phase to 'Processing' after request key is input", async () => {
    const logic = createLogic()
    uiMediator = new UIMediator()
    uiMediator.install(logic)

    const observer = new EventuallyObserver<Phase>()
    subscription.add(logic.phase$.subscribe(observer))

    logic.submitNewRequestFromSession("s1")
    
    const expectation = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.Processing)
    })
    
    await uiMediator.answerToRequestKey(true, "request-key")
    
    await expectation
  })
  
  it("should move phase to 'Nothing' on canceling request key input", async () => {
    const logic = createLogic()
    uiMediator = new UIMediator()
    uiMediator.install(logic)

    const observer = new EventuallyObserver<Phase>()
    subscription.add(logic.phase$.subscribe(observer))

    logic.submitNewRequestFromSession("s1")

    const expectation = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.Nothing)
    })
    
    await uiMediator.answerToRequestKey(false)
    await expectation
  })
  
  it("should call repository function", async () => {
    const logic = createLogic()
    uiMediator = new UIMediator()
    uiMediator.install(logic)

    logic.submitNewRequestFromSession("s1")
    await uiMediator.answerToRequestKey(true, "request-key")
    
    expect(mockRequestSubmissionRepository.addRequestFromSession).toBeCalledWith({
      requestKey: "request-key",
      sessionId: "s1"
    })
  })

  it("should move phase to 'Finished' after repository function is called", async () => {
    const logic = createLogic()
    uiMediator = new UIMediator()
    uiMediator.install(logic)

    const observer = new EventuallyObserver<Phase>()
    subscription.add(logic.phase$.subscribe(observer))

    logic.submitNewRequestFromSession("s1")

    const expectation = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.Finished)
    })
    
    await uiMediator.answerToRequestKey(true, "request-key")
    await expectation
  })
  
  it("should move phase to 'Nothing' after user closes the finish dialog", async () => {
    const logic = createLogic()
    uiMediator = new UIMediator()
    uiMediator.install(logic)

    const observer = new EventuallyObserver<Phase>()
    subscription.add(logic.phase$.subscribe(observer))

    logic.submitNewRequestFromSession("s1")

    const expectation = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.Nothing)
    })

    await uiMediator.answerToRequestKey(true, "request-key")
    await uiMediator.answerToFinished()
    await expectation
  })
  
  it("should move phase to 'Error' when repository function failed", async () => {
    mockRequestSubmissionRepository.addRequestFromSession.mockRejectedValue(new Error("Failed to add request"))
    const logic = createLogic()
    uiMediator = new UIMediator()
    uiMediator.install(logic)

    const observer = new EventuallyObserver<Phase>()
    subscription.add(logic.phase$.subscribe(observer))

    logic.submitNewRequestFromSession("s1")

    let errorPhase: ErrorPhase | undefined
    const expectation = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.Error)
      if (phase.type === PhaseTypes.Error) {
        errorPhase = phase
      }
    })

    await uiMediator.answerToRequestKey(true, "request-key")
    await expectation
    expect(errorPhase?.message).toBe("リクエストを処理できませんでした。")
  })
  
  it("should move phase to 'Nothing' after user closes the error dialog", async () => {
    mockRequestSubmissionRepository.addRequestFromSession.mockRejectedValue(new Error("Failed to add request"))
    const logic = createLogic()
    uiMediator = new UIMediator()
    uiMediator.install(logic)

    const observer = new EventuallyObserver<Phase>()
    subscription.add(logic.phase$.subscribe(observer))

    logic.submitNewRequestFromSession("s1")

    const expectation = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.Nothing)
    })

    await uiMediator.answerToRequestKey(true, "request-key")
    await uiMediator.answerToError()
    await expectation
  })
  
  it("should ask request key again if given key is not valid", async () => {
    mockRequestSubmissionRepository.addRequestFromSession.mockRejectedValue({
      code: "failed-precondition",
      details: "invalid_request_key"
    })

    const logic = createLogic()
    uiMediator = new UIMediator()
    uiMediator.install(logic)

    const observer = new EventuallyObserver<Phase>()
    subscription.add(logic.phase$.subscribe(observer))

    logic.submitNewRequestFromSession("s1")

    const expectProcessing = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.Processing)
    })
    await uiMediator.answerToRequestKey(true, "request-key")
    await expectProcessing

    const expectation = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.RequestKeyNeeded)
    })
    await expectation
  })
  
  it("should not ask request key when it holds last given key", async () => {
    const logic = createLogic()
    uiMediator = new UIMediator()
    uiMediator.install(logic)

    const observer = new EventuallyObserver<Phase>()
    subscription.add(logic.phase$.subscribe(observer))

    // First submission
    logic.submitNewRequestFromSession("s1")
    await uiMediator.answerToRequestKey(true, "request-key")
    await uiMediator.answerToFinished()

    const expectNothing = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.Nothing)
    })
    await expectNothing
    
    // Second submission
    const expectation = observer.expectValue(phase => {
      expect(phase.type).toBe(PhaseTypes.Finished)
    })
    logic.submitNewRequestFromSession("s2")
    await expectation
  })
})
