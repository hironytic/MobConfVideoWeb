//
// Firebase.ts
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

import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore as getFireStoreFromApp } from 'firebase/firestore';
import { from, Observable, switchMap } from "rxjs";

async function getFirebaseConfig(): Promise<object> {
  if (process.env.NODE_ENV !== 'production') {
    const config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG!)
    return config;
  } else {
    return (await fetch('/__/firebase/init.json')).json();
  }
}

async function initializeFirebaseApp(): Promise<FirebaseApp> {
  const config = await getFirebaseConfig();
  return initializeApp(config);
}

let firebaseApp: Promise<FirebaseApp> = initializeFirebaseApp();
async function getFirebaseApp(): Promise<FirebaseApp> {
  return firebaseApp;
}

export async function getFirestore(): Promise<Firestore> {
  return getFireStoreFromApp(await getFirebaseApp())
}

export function withFirestore<T>(builder: (firestore: Firestore) => Observable<T>): Observable<T> {
  return from(getFirestore()).pipe(
    switchMap(firestore => builder(firestore))
  );
}
