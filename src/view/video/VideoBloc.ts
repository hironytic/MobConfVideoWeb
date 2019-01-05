//
// VideoBloc.ts
//
// Copyright (c) 2018 Hironori Ichimiya <hiron@hironytic.com>
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

import { Observable, Observer } from "rxjs";
import { IBloc } from 'src/common/Bloc';
import DropdownState from 'src/common/DropdownState';
import Session from 'src/model/Session';

export interface IIdAndName {
  id: string,
  name: string,
}

export interface ISessionItem {
  session: Session;
  conferenceName: string;
  watchedEvents: IIdAndName[];
}

export enum SessionListState {
  NotLoaded,
  Loading,
  Loaded,
  Error,
}

export interface ISessionListLoaded {
  sessions: ISessionItem[];
}

export interface ISessionListError {
  message: string;
}

export interface ISessionList {
  state: SessionListState;
  loaded?: ISessionListLoaded;
  error?: ISessionListError;
}

export interface IVideoBloc extends IBloc {
  // inputs
  expandFilterPanel: Observer<boolean>;
  filterConferenceChanged: Observer<string>;
  filterSessionTimeChanged: Observer<string>;
  executeFilter: Observer<void>;

  // outputs
  isFilterPanelExpanded: Observable<boolean>;
  filterConference: Observable<DropdownState>;
  filterSessionTime: Observable<DropdownState>;
  sessionList: Observable<ISessionList>;
}
