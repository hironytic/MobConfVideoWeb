//
// SessionViewModel.ts
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

import { IRDE } from "../../utils/IRDE";
import { Session } from "../../models/Session";
import { ViewModel } from "../../utils/ViewModelProvider";
import { NEVER, Observable } from "rxjs";
import { DropdownState } from "../../utils/Dropdown";

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

export interface SessionViewModel extends ViewModel {
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

export class NullSessionViewModel implements SessionViewModel {
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

