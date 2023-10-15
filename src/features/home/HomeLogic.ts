//
// HomeLogic.ts
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

import { BehaviorSubject, filter, map, NEVER, Observable, retry, Subscription, tap } from "rxjs"
import { HomeRepository } from "./HomeRepository"
import { Logic } from "../../utils/LogicProvider"
import { Location, matchPath } from "react-router-dom"
import { Config } from "../../entities/Config"

export const HomeTabs = {
  Request: "request",
  Session: "session",
} as const

export type HomeTab = typeof HomeTabs[keyof typeof HomeTabs] | false

export interface HomeLogic extends Logic {
  setLocation(value: Location): void
  
  isInMaintenance$: Observable<boolean>
  homeTab$: Observable<HomeTab>
}

export class NullHomeLogic implements HomeLogic {
  dispose() { /* do nothing */ }
  
  setLocation(value: Location) { /* do nothing */ }

  isInMaintenance$ = NEVER
  homeTab$ = NEVER
}

export class AppHomeLogic implements HomeLogic {
  private readonly subscription = new Subscription()  
  
  private config$ = new BehaviorSubject<Config | undefined>(undefined)
  homeTab$ = new BehaviorSubject<HomeTab>(false)

  isInMaintenance$: Observable<boolean>
  
  constructor(configRepository: HomeRepository) {
    const config$ = configRepository.getConfig$().pipe(
      tap({ error(error) { console.error("Error occurred in HomeRepository.config$", error) }}),
      retry({ delay: 10_000 }),
    )
    this.subscription.add(config$.subscribe({
      next: (value) => {
        this.config$.next(value)
      }
    }))

    this.isInMaintenance$ = this.config$.pipe(
      filter((it: Config | undefined): it is Config => it !== undefined),
      map(it => it.isInMaintenance)
    )
  }

  dispose() {
    this.subscription.unsubscribe()
  }
  
  setLocation({ pathname }: Location) {
    if (matchPath({ path: "/request", end: false }, pathname) !== null) {
      this.homeTab$.next(HomeTabs.Request)
    } else if (matchPath({ path: "/session", end: false }, pathname) !== null) {
      this.homeTab$.next(HomeTabs.Session)
    } else {
      this.homeTab$.next(false)
    }
  }
}
