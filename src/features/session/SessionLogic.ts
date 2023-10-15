//
// SessionLogic.ts
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

import { IRDE, IRDETypes } from "../../utils/IRDE"
import { Session } from "../../entities/Session"
import { Logic } from "../../utils/LogicProvider"
import { BehaviorSubject, NEVER, Observable, Subscription } from "rxjs"
import { DropdownState } from "../../utils/Dropdown"
import { SessionRepository } from "./SessionRepository"
import { runDetached } from "../../utils/RunDetached"
import { executeOnce } from "../../utils/ExecuteOnce"
import { errorMessage } from "../../utils/ErrorMessage"
import { IdAndName } from "../session_detail/WatchedEvents"
import { FilteredSessions, SessionFilter } from "../../Firestore"

export interface SessionItem {
  session: Session
  conferenceName: string
  watchedEvents: IdAndName[]
}

export const MoreRequestTypes = {
  Requestable: "Requestable",
  Unrequestable: "Unrequestable",
  Requesting: "Requesting",
} as const
export interface MoreRequestRequestable {
  type: typeof MoreRequestTypes.Requestable,
  request: (() => void),
}
export interface MoreRequestUnrequestable {
  type: typeof MoreRequestTypes.Unrequestable,
}
export interface MoreRequestRequesting {
  type: typeof MoreRequestTypes.Requesting,
}
export type MoreRequest = MoreRequestRequestable | MoreRequestUnrequestable | MoreRequestRequesting

export interface SessionListDoneProp {
  sessions: SessionItem[]
  keywordList: string[]
  moreRequest: MoreRequest
}
export interface SessionListErrorProp {
  message: string
}
export type SessionListIRDE = IRDE<object, object, SessionListDoneProp, SessionListErrorProp>

export interface FilterParams {
  conference: string | undefined
  sessionTime: string | undefined
  keywords: string
}

export interface SessionLogic extends Logic {
  expandFilterPanel(isExpand: boolean): void
  filterConferenceChanged(value: string): void
  filterSessionTimeChanged(value: string): void
  filterKeywordsChanged(value: string): void
  executeFilter(params: FilterParams, force: boolean): void
  clearFilter(): void

  isFilterPanelExpanded$: Observable<boolean>
  filterConference$: Observable<DropdownState>
  filterSessionTime$: Observable<DropdownState>
  filterKeywords$: Observable<string>
  sessionList$: Observable<SessionListIRDE>
}

export class NullSessionLogic implements SessionLogic {
  dispose() { /* do nothing */ }
  
  expandFilterPanel(_isExpand: boolean) { /* do nothing */ }
  filterConferenceChanged(_value: string) { /* do nothing */ }
  filterSessionTimeChanged(_value: string) { /* do nothing */ }
  filterKeywordsChanged(_value: string) { /* do nothing */ }
  executeFilter(_params: FilterParams, _force: boolean) { /* do nothing */ }
  clearFilter() { /* do nothing */ }

  isFilterPanelExpanded$ = NEVER
  filterConference$ = NEVER
  filterSessionTime$ = NEVER
  filterKeywords$ = NEVER
  sessionList$ = NEVER
}

const UNSPECIFIED_STATE: DropdownState = { value: "-", items: [{ value: "-", title: "指定なし" }]}
const SESSION_TIMES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 120]

export class AppSessionLogic implements SessionLogic {
  private readonly subscription = new Subscription()

  isFilterPanelExpanded$ = new BehaviorSubject(true)
  filterConference$ = new BehaviorSubject(UNSPECIFIED_STATE)
  filterSessionTime$ = new BehaviorSubject({
    value: UNSPECIFIED_STATE.value,
    items: [
      ...UNSPECIFIED_STATE.items,
      ...(SESSION_TIMES.map(it => ({ value: it.toString(), title: `${it}分` }))),
    ]
  })
  filterKeywords$ = new BehaviorSubject("")
  sessionList$ = new BehaviorSubject<SessionListIRDE>({ type: IRDETypes.Initial })
  private currentFilterParams: FilterParams | undefined = undefined
  
  constructor(private readonly repository: SessionRepository) {
    this.subscription.add(
      repository
        .getAllConferences$()
        .subscribe({
          next: conferences => {
            const items = [
              ...UNSPECIFIED_STATE.items,
              ...(conferences.map(conf => ({ value: conf.id,  title: conf.name })))
            ]
            let value = this.filterConference$.value.value
            if (items.find(it => it.value === value) === undefined) {
              value = UNSPECIFIED_STATE.value
            }
            this.filterConference$.next({ value, items })
          },
          error: err => {
            console.log("Error at getAllConferences$ in AppSessionLogic", err)
            this.filterConference$.next({
              value: "_error_",
              items: [
                {
                  value: "_error_",
                  title: "<<エラー>>",
                }
              ]
            })
          },
        })
    )
  }
  
  dispose() {
    this.subscription.unsubscribe()
  }
  
  expandFilterPanel(isExpand: boolean) {
    this.isFilterPanelExpanded$.next(isExpand)
  }
  
  private filterChanged(value: string, state: BehaviorSubject<DropdownState>) {
    const { items } = state.value
    if (items.find(it => it.value === value) !== undefined) {
      state.next({ value, items })
    }
  }
  
  filterConferenceChanged(value: string) {
    this.filterChanged(value, this.filterConference$)
  }
  
  filterSessionTimeChanged(value: string) {
    this.filterChanged(value, this.filterSessionTime$)
  }
  
  filterKeywordsChanged(value: string) {
    this.filterKeywords$.next(value)
  }

  executeFilter(filterParams: FilterParams, force: boolean) {
    if (!force &&
        this.currentFilterParams?.conference === filterParams.conference &&
        this.currentFilterParams?.sessionTime === filterParams.sessionTime &&
        this.currentFilterParams?.keywords === filterParams.keywords) {
      return
    }
    this.currentFilterParams = filterParams
    
    // Apply filter params to UI controls.
    this.filterChanged(filterParams.conference ?? "-", this.filterConference$)
    this.filterChanged(filterParams.sessionTime ?? "-", this.filterSessionTime$)
    this.filterKeywords$.next(filterParams?.keywords ?? "")
    
    // Close filter panel.
    this.isFilterPanelExpanded$.next(false)

    // Search sessions.
    runDetached(() => this.searchSessions())
  }
  
  private async searchSessions() {
    const filterParams = this.currentFilterParams
    if (filterParams === undefined) {
      return
    }
    
    try {
      const keywords = filterParams.keywords.trim()
      const keywordList = (keywords === "") ? [] : keywords.trim().split(/\s+/)
      const sessionFilter: SessionFilter = {}
      if (filterParams.conference !== undefined) {
        sessionFilter.conferenceId = filterParams.conference
      }
      if (filterParams.sessionTime !== undefined) {
        sessionFilter.minutes = Number(filterParams.sessionTime)
      }
      sessionFilter.keywords = keywordList

      // Make loading.
      this.sessionList$.next({type: IRDETypes.Running})

      // Ready conference name and event name.
      const conferenceNameMap = this.filterConference$.value.items.reduce((acc, item) => {
        if (item.value !== UNSPECIFIED_STATE.items[0].value) {
          acc.set(item.value, item.title)
        }
        return acc
      }, new Map<string, string>())
      const events = await this.repository.getAllEvents()
      const convertSessions = (sessions: Session[]): SessionItem[] => {
        return sessions.map(session => {
          const conferenceName = conferenceNameMap.get(session.conferenceId) ?? ""
          const watchedEvents = events
            .filter(event => session.watchedOn[event.id] !== undefined)
            .map(event => ({id: event.id, name: event.name}))
          return {session, conferenceName, watchedEvents}
        })
      }

      // Retrieve sessions.
      let sessionItems: SessionItem[] = []
      const updateSessionList = ({sessions, more}: FilteredSessions) => {
        sessionItems = [...sessionItems, ...convertSessions(sessions)]

        let moreRequest: MoreRequest = {type: MoreRequestTypes.Unrequestable}
        if (more !== undefined) {
          moreRequest = {
            type: MoreRequestTypes.Requestable,
            request: executeOnce(() => {
              // Make it loading
              this.sessionList$.next({
                type: IRDETypes.Done,
                sessions: sessionItems,
                keywordList,
                moreRequest: {type: MoreRequestTypes.Requesting},
              })

              // Do search more
              runDetached(async () => {
                try {
                  const filteredSessions = await more()
                  updateSessionList(filteredSessions)
                } catch (err) {
                  console.log("Error at searchSessions (more)", err)
                  this.sessionList$.next({
                    type: IRDETypes.Error,
                    message: errorMessage(err),
                  })
                }
              })
            }),
          }
        }

        this.sessionList$.next({
          type: IRDETypes.Done,
          sessions: sessionItems,
          keywordList,
          moreRequest,
        })
      }
      const filteredSessions = await this.repository.getSessions(sessionFilter)
      updateSessionList(filteredSessions)
    } catch (err) {
      console.log("Error at searchSessions", err)
      this.sessionList$.next({
        type: IRDETypes.Error,
        message: errorMessage(err),
      })
    }
  }
  
  clearFilter() {
    this.isFilterPanelExpanded$.next(true)
    this.currentFilterParams = undefined
    this.sessionList$.next({ type: IRDETypes.Initial })
  }
}
