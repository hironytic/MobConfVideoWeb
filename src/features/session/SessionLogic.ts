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

import { IRDE, IRDETypes } from "../../utils/IRDE";
import { Session, WatchedOn } from "../../entities/Session";
import { Logic } from "../../utils/LogicProvider";
import { BehaviorSubject, NEVER, Observable, Subscription } from "rxjs";
import { DropdownState } from "../../utils/Dropdown";
import { SessionFilter, SessionRepository } from "./SessionRepository";
import { runDetached } from "../../utils/RunDetached";

export interface IdAndName {
  id: string;
  name: string;
}

export interface SessionItem {
  session: Session;
  conferenceName: string;
  watchedEvents: IdAndName[];
}

export type SessionListIRDE = IRDE<{}, {}, { sessions: SessionItem[], keywordList: string[] }, { message: string }>;

export interface FilterParams {
  conference: string | undefined;
  sessionTime: string | undefined;
  keywords: string;
}

export interface SessionLogic extends Logic {
  expandFilterPanel(isExpand: boolean): void;
  filterConferenceChanged(value: string): void;
  filterSessionTimeChanged(value: string): void;
  filterKeywordsChanged(value: string): void;
  executeFilter(params: FilterParams | undefined): void;

  isFilterPanelExpanded$: Observable<boolean>;
  filterConference$: Observable<DropdownState>;
  filterSessionTime$: Observable<DropdownState>;
  filterKeywords$: Observable<string>;
  sessionList$: Observable<SessionListIRDE>;
  currentFilterParams: FilterParams | undefined;
}

export class NullSessionLogic implements SessionLogic {
  dispose() {}
  
  expandFilterPanel(isExpand: boolean) {}
  filterConferenceChanged(value: string) {}
  filterSessionTimeChanged(value: string) {}
  filterKeywordsChanged(value: string) {}
  executeFilter(params: FilterParams | undefined) {}
  
  isFilterPanelExpanded$ = NEVER;
  filterConference$ = NEVER;
  filterSessionTime$ = NEVER;
  filterKeywords$ = NEVER;
  sessionList$ = NEVER;
  currentFilterParams = undefined;
}

const UNSPECIFIED_STATE: DropdownState = { value: "-", items: [{ value: "-", title: "指定なし" }]};
const SESSION_TIMES = [5, 10, 15, 20, 30, 40, 45, 50, 60, 70, 120];

export class AppSessionLogic implements SessionLogic {
  private readonly subscription = new Subscription();

  isFilterPanelExpanded$ = new BehaviorSubject(true);
  filterConference$ = new BehaviorSubject(UNSPECIFIED_STATE);
  filterSessionTime$ = new BehaviorSubject({
    value: UNSPECIFIED_STATE.value,
    items: [
      ...UNSPECIFIED_STATE.items,
      ...(SESSION_TIMES.map(it => ({ value: it.toString(), title: `${it}分` }))),
    ]
  });
  filterKeywords$ = new BehaviorSubject("");
  sessionList$ = new BehaviorSubject<SessionListIRDE>({ type: IRDETypes.Initial });
  currentFilterParams: FilterParams | undefined = undefined;
  
  constructor(private readonly repository: SessionRepository) {
    this.subscription.add(
      repository
        .getAllConferences$()
        .subscribe({
          next: conferences => {
            const items = [
              ...UNSPECIFIED_STATE.items,
              ...(conferences.map(conf => ({ value: conf.id,  title: conf.name })))
            ];
            let value = this.filterConference$.value.value;
            if (items.find(it => it.value === value) === undefined) {
              value = UNSPECIFIED_STATE.value;
            }
            this.filterConference$.next({ value, items });
          },
          error: err => {
            console.log("Error at getAllConferences$ in AppSessionLogic", err);
            this.filterConference$.next({
              value: "_error_",
              items: [
                {
                  value: "_error_",
                  title: "<<エラー>>",
                }
              ]
            });
          },
        })
    );
  }
  
  dispose() {
    this.subscription.unsubscribe();
  }
  
  expandFilterPanel(isExpand: boolean) {
    this.isFilterPanelExpanded$.next(isExpand);
  }
  
  private filterChanged(value: string, state: BehaviorSubject<DropdownState>) {
    const { items } = state.value;
    if (items.find(it => it.value === value) !== undefined) {
      state.next({ value, items });
    }
  }
  
  filterConferenceChanged(value: string) {
    this.filterChanged(value, this.filterConference$);
  }
  
  filterSessionTimeChanged(value: string) {
    this.filterChanged(value, this.filterSessionTime$);
  }
  
  filterKeywordsChanged(value: string) {
    this.filterKeywords$.next(value);
  }

  executeFilter(filterParams: FilterParams | undefined) {
    if (this.currentFilterParams?.conference === filterParams?.conference &&
        this.currentFilterParams?.sessionTime === filterParams?.sessionTime &&
        this.currentFilterParams?.keywords === filterParams?.keywords) {
      return;
    }
    this.currentFilterParams = filterParams;
    
    // Apply filter params to UI controls.
    this.filterChanged(filterParams?.conference ?? "-", this.filterConference$);
    this.filterChanged(filterParams?.sessionTime ?? "-", this.filterSessionTime$);
    this.filterKeywords$.next(filterParams?.keywords ?? "");
    
    if (filterParams === undefined) {
      // Open filter panel.
      this.isFilterPanelExpanded$.next(true);
    } else {
      // Close filter panel.
      this.isFilterPanelExpanded$.next(false);

      // Search sessions.
      runDetached(() => this.searchSessions());
    }
  }
  
  private async searchSessions() {
    const filterParams = this.currentFilterParams;
    if (filterParams === undefined) {
      return;
    }
    
    const keywords = filterParams.keywords.trim();
    const keywordList = (keywords === "") ? [] : keywords.trim().split(/\s+/); 
    const sessionFilter: SessionFilter = {};
    if (filterParams.conference !== undefined) {
      sessionFilter.conferenceId = filterParams.conference;
    }
    if (filterParams.sessionTime !== undefined) {
      sessionFilter.minutes = Number(filterParams.sessionTime);
    }
    sessionFilter.keywords = keywordList;

    // Make loading.
    this.sessionList$.next({ type: IRDETypes.Running });
    
    // Retrieve sessions.
    const { sessions } = await this.repository.getSessions(sessionFilter);
    const conferenceNameMap = this.filterConference$.value.items.reduce((acc, item) => {
      if (item.value !== UNSPECIFIED_STATE.items[0].value) {
        acc.set(item.value, item.title);
      }
      return acc;
    }, new Map<string, string>());
    const events = await this.repository.getAllEvents();
    const getWatchedEvents = (watchedOn: WatchedOn): IdAndName[] => {
      return events
        .filter(event => watchedOn[event.id] !== undefined)
        .map(event => ({ id: event.id, name: event.name }))
    };
    const sessionItems: SessionItem[] = sessions.map(session => {
      const conferenceName = conferenceNameMap.get(session.conferenceId) ?? "";
      const watchedEvents = getWatchedEvents(session.watchedOn);
      return { session, conferenceName, watchedEvents };
    });
    this.sessionList$.next({
      type: IRDETypes.Done,
      sessions: sessionItems,
      keywordList,
    });
  }
}
