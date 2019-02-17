//
// RequestDetailBloc.ts
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
import { IBloc } from 'src/common/Bloc';
import Request from 'src/model/Request';

export enum RequestDetailState {
  NotLoaded,
  Loading,
  Loaded,
  Error,
}

export interface IRequestDetailNotLoaded {
  state: RequestDetailState.NotLoaded;
}

export interface IRequestDetailLoading {
  state: RequestDetailState.Loading;
}

export interface IRequestDetailLoaded {
  state: RequestDetailState.Loaded;
  request: Request;
}

export interface IRequestDetailError {
  state: RequestDetailState.Error;
  message: string;
}

export type IRequestDetail = IRequestDetailNotLoaded | IRequestDetailLoading | IRequestDetailLoaded | IRequestDetailError;

export interface IRequestRef {
  eventId: string;
  requestId: string;
}

export interface IRequestDetailBloc extends IBloc {
  // inputs
  showRequest: Observer<IRequestRef>;
  dialogClosed: Observer<void>;

  // outputs
  dialogOpen: Observable<boolean>;
  requestDetail: Observable<IRequestDetail>;
}