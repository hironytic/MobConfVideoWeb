//
// SignInLogic.ts
//
// Copyright (c) 2023 Hironori Ichimiya <hiron@hironytic.com>
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
import { SignInRepository } from "./SignInRepository"
import { NEVER, Observable } from "rxjs"
import { runDetached } from "../../utils/RunDetached"

export interface SignInLogic extends Logic {
  isAuthenticated$: Observable<boolean>
  // isLinkedToGoogle$: Observable<boolean>
  
  signOut(): void
  signInWithGoogle(): void
}

export class NullSignInLogic implements SignInLogic {
  dispose() {}
  get isAuthenticated$(): Observable<boolean> { return NEVER }
  // get isLinkedToGoogle$(): Observable<boolean> { return NEVER }
  signOut() {}
  signInWithGoogle() {}
}

export class AppSignInLogic implements SignInLogic {
  constructor(private readonly repository: SignInRepository) {
  }
  
  dispose() {
  }
  
  get isAuthenticated$(): Observable<boolean> {
    return this.repository.isAuthenticated$()
  }
  
  // get isLinkedToGoogle$(): Observable<boolean> {
  //   return this.repository.isLinkedToGoogle$()
  // }
  
  signOut() {
    runDetached(async () => {
      await this.repository.signOut()
    })
  }

  signInWithGoogle() {
    runDetached(async () => {
      // TODO: Error handling.
      await this.repository.signInWithGoogle()
    })
  }
}
