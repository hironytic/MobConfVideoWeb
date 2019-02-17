//
// MockRequestRepository.ts
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

import { never, Observable } from 'rxjs';
import Request from "src/model/Request";
import { IAddRequestFromSessionData, IAddRequestWithoutSessionData, IRequestRepository } from 'src/repository/RequestRepository';

export default class MockRequestRepository implements IRequestRepository {
  public getAllRequestsObservable = jest.fn((eventId: string) => never() as Observable<Request[]>);
  public getRequestObservable = jest.fn((eventId: string, requestId: string) => never() as Observable<Request>);
  public addRequestFromSession = jest.fn((data: IAddRequestFromSessionData) => Promise.reject<void>(new Error("Not Implemented")));
  public addRequestWithoutSession = jest.fn((data: IAddRequestWithoutSessionData) => Promise.reject<void>(new Error("Not Implemented")));
}