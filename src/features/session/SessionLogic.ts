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
import { Session } from "../../entities/Session";
import { Logic } from "../../utils/LogicProvider";
import { BehaviorSubject, NEVER, Observable, Subscription } from "rxjs";
import { DropdownState } from "../../utils/Dropdown";
import { SessionRepository } from "./SessionRepository";

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

export interface SessionLogic extends Logic {
  expandFilterPanel(isExpand: boolean): void;
  filterConferenceChanged(value: string): void;
  filterSessionTimeChanged(value: string): void;
  filterKeywordsChanged(value: string): void;
  executeFilter(): void;

  isFilterPanelExpanded$: Observable<boolean>;
  filterConference$: Observable<DropdownState>;
  filterSessionTime$: Observable<DropdownState>;
  filterKeywords$: Observable<string>;
  sessionList$: Observable<SessionListIRDE>;
}

export class NullSessionLogic implements SessionLogic {
  dispose() {}
  
  expandFilterPanel(isExpand: boolean) {}
  filterConferenceChanged(value: string) {}
  filterSessionTimeChanged(value: string) {}
  filterKeywordsChanged(value: string) {}
  executeFilter() {}
  
  isFilterPanelExpanded$ = NEVER;
  filterConference$ = NEVER;
  filterSessionTime$ = NEVER;
  filterKeywords$ = NEVER;
  sessionList$ = NEVER;
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
  sessionList$ = new BehaviorSubject({ type: IRDETypes.Initial });
  
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
  
  executeFilter() {
  }
}
