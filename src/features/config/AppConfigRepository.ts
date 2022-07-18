//
// AppConfigRepository.ts
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

import { ConfigRepository } from "./ConfigContext";
import { from, map, Observable, retry, shareReplay, switchMap, tap } from "rxjs";
import { Config, configConverter } from "../../models/Config";
import { getFirestore } from "../../Firebase";
import { collection, doc, DocumentSnapshot, onSnapshot } from 'firebase/firestore';

export class AppConfigRepository implements ConfigRepository {
  private config$_: Observable<Config> | undefined = undefined;
  
  get config$(): Observable<Config> {
    if (this.config$_ === undefined) {
      this.config$_ = from(getFirestore()).pipe(
        switchMap(firestore => {
          const collectionRef = collection(firestore, "config");
          const docRef = doc(collectionRef, "config").withConverter(configConverter);
          return new Observable<DocumentSnapshot<Config>>(subscriber => {
            return onSnapshot(docRef, subscriber);
          });
        }),
        map(snapshot => {
          const config = snapshot.data();
          if (config === undefined) {
            throw new Error("Configuration value is not found on Firestore!");
          }
          return config;
        }),
        tap({ error(error) { console.error("Error occurred in AppConfigRepository.config$", error) }}),
        retry({ delay: 10_000 }),
        shareReplay(1),
      );
    }
    return this.config$_;
  }
}
