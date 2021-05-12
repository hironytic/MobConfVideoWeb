//
// SessionDetailBloc.ts
//
// Copyright (c) 2019 Hironori Ichimiya <hiron@hironytic.com>
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

import { Observable, Observer } from 'rxjs';
import { IBloc } from '../../common/Bloc';
import Session from '../../model/Session';

export interface IIdAndName {
  id: string,
  name: string,
}

export interface ISessionItem {
  session: Session;
  conferenceName: string;
  watchedEvents: IIdAndName[];
  canRequest: boolean;
}

export enum SessionDetailState {
  NotLoaded,
  Loading,
  Loaded,
  Error,
}

export interface ISessionDetailNotLoaded {
  state: SessionDetailState.NotLoaded;
}

export interface ISessionDetailLoading {
  state: SessionDetailState.Loading;
}

export interface ISessionDetailLoaded {
  state: SessionDetailState.Loaded;
  session: ISessionItem;
}

export interface ISessionDetailError {
  state: SessionDetailState.Error;
  message: string;
}

export type ISessionDetail = ISessionDetailNotLoaded | ISessionDetailLoading | ISessionDetailLoaded | ISessionDetailError;

export interface IShowSessionParam {
  sessionId: string,
  canRequest: boolean,
}

export interface ISessionDetailBloc extends IBloc {
  // inputs
  showSession: Observer<IShowSessionParam>;
  dialogClosed: Observer<void>;

  // outputs
  dialogOpen: Observable<boolean>;
  sessionDetail: Observable<ISessionDetail>;
}
