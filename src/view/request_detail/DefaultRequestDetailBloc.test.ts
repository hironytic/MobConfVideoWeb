//
// DefaultRequestDetailBloc.test.ts
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

import { never, Subject, Subscription, throwError } from 'rxjs';
import { startWith } from 'rxjs/operators';
import Request from '../../model/Request';
import EventuallyObserver from '../../test/EventuallyObserver';
import MockRequestRepository from '../../test/mock/MockRequestRepository';
import DefaultRequestDetailBloc from './DefaultRequestDetailBloc';
import { IRequestDetail, IRequestDetailBloc, IRequestDetailError, IRequestDetailLoaded, RequestDetailState } from "./RequestDetailBloc";

let mockRequestRepository: MockRequestRepository;
let subscription: Subscription;
let bloc: IRequestDetailBloc;

const request1 = new Request("r1", "s1", "Request 1", "Conference 1", 30, "https://example.com/video1", "https://example.com/slide1", "", true);
const request1x = new Request("r1", "s1", "Request 1x", "Conference 1", 30, "https://example.com/video1", "https://example.com/slide1", "", true);

function createBloc() {
  bloc = DefaultRequestDetailBloc.create(mockRequestRepository);
}

beforeEach(() => {
  mockRequestRepository = new MockRequestRepository();
  subscription = new Subscription();
  bloc = undefined!;
});

afterEach(() => {
  subscription.unsubscribe();
  if (bloc) {
    bloc.dispose();
  }
});

it("is closed on beginning", async () => {
  createBloc();
  const observer = new EventuallyObserver<boolean>();
  const expectation = observer.expectValue(value => {
    expect(value).toBe(false);
  });
  bloc.dialogOpen.subscribe(observer);
  await expectation;
});

it("is opened by user's request", async () => {
  createBloc();
  const observer = new EventuallyObserver<boolean>();
  const expectation = observer.expectValue(value => {
    expect(value).toBe(true);
  });
  bloc.dialogOpen.subscribe(observer);

  bloc.showRequest.next({
    eventId: "e1",
    requestId: "r1",
  });
  await expectation;
});

it("is closed by user's request", async () => {
  createBloc();
  const observer = new EventuallyObserver<boolean>();
  const expectationForOpened = observer.expectValue(value => {
    expect(value).toBe(true);
  });
  bloc.dialogOpen.subscribe(observer);

  bloc.showRequest.next({
    eventId: "e1",
    requestId: "r1",
  });
  await expectationForOpened;

  const expectationForClosed = observer.expectValue(value => {
    expect(value).toBe(false);
  });
  bloc.dialogClosed.next();
  await expectationForClosed;
});

it("shows a request", async() => {
  mockRequestRepository.getRequestObservable.mockReturnValue(never().pipe(
    startWith(request1),
  ));
  createBloc();
  const observer = new EventuallyObserver<IRequestDetail>();
  bloc.requestDetail.subscribe(observer);

  const expectationOfLoading = observer.expectValue(requestDetail => {
    expect(requestDetail.state).toBe(RequestDetailState.Loading);
  });
  const expectationOfLoaded = observer.expectValue(requestDetail => {
    expect(requestDetail.state).toBe(RequestDetailState.Loaded);
    expect((requestDetail as IRequestDetailLoaded).request).toBe(request1);
  });
  bloc.showRequest.next({
    eventId: "e1",
    requestId: "r1",
  });
  await expectationOfLoading;
  await expectationOfLoaded;
});

it("loads an appropriate request", async () => {
  createBloc();
  bloc.showRequest.next({
    eventId: "e1",
    requestId: "r1",
  });

  expect(mockRequestRepository.getRequestObservable.mock.calls.length).toBe(1);
  expect(mockRequestRepository.getRequestObservable.mock.calls[0][0]).toBe("e1");
  expect(mockRequestRepository.getRequestObservable.mock.calls[0][1]).toBe("r1");
});

it("follow the change of the request", async () => {
  const mockSubject = new Subject<Request>();
  mockRequestRepository.getRequestObservable.mockReturnValue(mockSubject.pipe(
    startWith(request1),
  ));
  createBloc();
  const observer = new EventuallyObserver<IRequestDetail>();
  bloc.requestDetail.subscribe(observer);

  const expectationOfLoaded1 = observer.expectValue(requestDetail => {
    expect(requestDetail.state).toBe(RequestDetailState.Loaded);
    expect((requestDetail as IRequestDetailLoaded).request).toBe(request1);
  });
  bloc.showRequest.next({
    eventId: "e1",
    requestId: "r1",
  });
  await expectationOfLoaded1;

  const expectationOfLoaded1x = observer.expectValue(requestDetail => {
    expect(requestDetail.state).toBe(RequestDetailState.Loaded);
    expect((requestDetail as IRequestDetailLoaded).request).toBe(request1x);
  });

  mockSubject.next(request1x);
  await expectationOfLoaded1x;
});

it("emits an error state when failed to load request", async () => {
  const error = new Error("failed to load");
  mockRequestRepository.getRequestObservable.mockReturnValue(throwError(error));
  createBloc();
  const observer = new EventuallyObserver<IRequestDetail>();
  bloc.requestDetail.subscribe(observer);

  const expectation = observer.expectValue(requestDetail => {
    expect(requestDetail.state).toBe(RequestDetailState.Error);
    expect((requestDetail as IRequestDetailError).message).toBe(error.toString());
  });
  bloc.showRequest.next({
    eventId: "e1",
    requestId: "r1",
  });
  await expectation;
});
