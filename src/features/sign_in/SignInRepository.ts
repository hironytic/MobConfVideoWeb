//
// SignInRepository.ts
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

import { map, Observable } from "rxjs"
import { FirebaseAuth } from "../../FirebaseAuth"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { getAuth } from "../../Firebase"

export interface SignInRepository {
  isAuthenticated$(): Observable<boolean>
  // isLinkedToGoogle$(): Observable<boolean>
  signOut(): Promise<void>
  signInWithGoogle(): Promise<void>
}

export class FirebaseSignInRepository implements SignInRepository{
  isAuthenticated$(): Observable<boolean> {
    return FirebaseAuth.getCurrentUser$().pipe(
      map(user => user !== undefined)
    )
  }
  
  // isLinkedToGoogle$(): Observable<boolean> {
  //   return FirebaseAuth.getCurrentUser$().pipe(
  //     map(user => {
  //       if (user === undefined) { return false }
  //       return user.providerData.find(userInfo => userInfo.providerId === GoogleAuthProvider.PROVIDER_ID) !== undefined 
  //     })
  //   )
  // }

  async signOut(): Promise<void> {
    const auth = await getAuth()
    await auth.signOut()
  }
  
  async signInWithGoogle(): Promise<void> {
    const auth = await getAuth()
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }
}
