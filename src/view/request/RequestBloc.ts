//
// IRequestBloc.ts
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
import { IBloc } from '../../common/Bloc';
import Event from "../../model/Event";
import Request from "../../model/Request";

export enum RequestListState {
  NotLoaded,
  Loading,
  Loaded,
  Error,
}

export interface IRequestListNotLoaded {
  state: RequestListState.NotLoaded;
}

export interface IRequestListLoading {
  state: RequestListState.Loading;
}

export interface IRequestListLoaded {
  state: RequestListState.Loaded;
  requests: Request[];
}

export interface IRequestListError {
  state: RequestListState.Error;
  message: string;
}

export type IRequestList = IRequestListNotLoaded | IRequestListLoading | IRequestListLoaded | IRequestListError;

export interface IRequestBloc extends IBloc {
  // inputs
  currentEventIdChanged: Observer<string | false>;

  // outputs
  allEvents: Observable<Event[]>;
  currentEventId: Observable<string | false>;
  requestList: Observable<IRequestList>;
}
