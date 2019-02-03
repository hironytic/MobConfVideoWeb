//
// DefaultSessionDetailBloc.test.ts
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

import { never, Subscription, throwError } from "rxjs";
import { startWith } from 'rxjs/operators';
import Conference from 'src/model/Conference';
import Event from 'src/model/Event';
import Session from 'src/model/Session';
import Speaker from 'src/model/Speaker';
import EventuallyObserver from 'src/test/EventuallyObserver';
import MockConferenceRepository from 'src/test/mock/MockConferenceRepository';
import MockEventRepository from 'src/test/mock/MockEventRepository';
import MockSessionRepository from 'src/test/mock/MockSessionRepository';
import DefaultSessionDetailBloc from './DefaultSessionDetailBloc';
import { ISessionDetail, ISessionDetailBloc, ISessionDetailError, ISessionDetailLoaded, SessionDetailState } from './SessionDetailBloc';

let mockConferenceRepository: MockConferenceRepository;
let mockEventRepository: MockEventRepository;
let mockSessionRepository: MockSessionRepository;
let subscription: Subscription;
let bloc: ISessionDetailBloc;

const conferences1 = [
  new Conference("c1", "Conf 1", new Date(Date.UTC(2016, 7, 20, 1, 0))),
  new Conference("c2", "Conf 2", new Date(Date.UTC(2017, 8, 15, 8, 30))),
  new Conference("c3", "Conf 3", new Date(Date.UTC(2018, 7, 30, 9, 0))),
];

const session1 = new Session("s1", "c1", true, {"e1": 1, "e3": 2}, "Session 1", "", new Date(Date.UTC(2018, 7, 30, 11, 0)), 30, "https://example.com/slide1", "https://example.com/video1", [
  new Speaker("Speaker 1", "speaker1", undefined),
]);

const events1 = [
  new Event("e3", "Event 3", true),
  new Event("e2", "Event 2", false),
  new Event("e1", "Event 1", false),
];

function createBloc() {
  bloc = DefaultSessionDetailBloc.create(mockConferenceRepository, mockEventRepository, mockSessionRepository);
}

beforeEach(() => {
  mockConferenceRepository = new MockConferenceRepository();
  mockEventRepository = new MockEventRepository();
  mockSessionRepository = new MockSessionRepository();
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

  bloc.showSession.next({
    sessionId: "s1",
    canRequest: false,
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

  bloc.showSession.next({
    sessionId: "s1",
    canRequest: false,
  });
  await expectationForOpened;

  const expectationForClosed = observer.expectValue(value => {
    expect(value).toBe(false);
  });
  bloc.dialogClosed.next();
  await expectationForClosed;
});

it("shows a session", async() => {
  mockConferenceRepository.getAllConferencesObservable.mockReturnValue(never().pipe(
    startWith(conferences1),
  ));
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(events1),
  ));
  mockSessionRepository.getSessionObservable.mockReturnValue(never().pipe(
    startWith(session1),
  ));
  createBloc();
  const observer = new EventuallyObserver<ISessionDetail>();
  bloc.sessionDetail.subscribe(observer);

  const expectationOfLoading = observer.expectValue(sessionDetail => {
    expect(sessionDetail.state).toBe(SessionDetailState.Loading);
  });
  const expectationOfLoaded = observer.expectValue(sessionDetail => {
    expect(sessionDetail.state).toBe(SessionDetailState.Loaded);
    const sessionDetailLoaded = sessionDetail as ISessionDetailLoaded;
    expect(sessionDetailLoaded.session.session).toEqual(session1);
    expect(sessionDetailLoaded.session.conferenceName).toBe("Conf 1");
    expect(sessionDetailLoaded.session.watchedEvents).toEqual([
      {id: "e3", name: "Event 3"},
      {id: "e1", name: "Event 1"},
    ]);
    expect(sessionDetailLoaded.session.canRequest).toBe(true);
  });
  bloc.showSession.next({
    sessionId: "s1",
    canRequest: true,
  });
  await expectationOfLoading;
  await expectationOfLoaded;
});

it("loads an appropriate session", async () => {
  createBloc();
  bloc.showSession.next({
    sessionId: "s1",
    canRequest: true,
  });

  expect(mockSessionRepository.getSessionObservable).toHaveBeenCalledWith("s1");
});

it("emits an error state when failed to load session", async () => {
  const error = new Error("failed to load");
  mockSessionRepository.getSessionObservable.mockReturnValue(throwError(error));
  createBloc();
  const observer = new EventuallyObserver<ISessionDetail>();
  bloc.sessionDetail.subscribe(observer);

  const expectation = observer.expectValue(sessionDetail => {
    expect(sessionDetail.state).toBe(SessionDetailState.Error);
    expect((sessionDetail as ISessionDetailError).message).toBe(error.toString());
  });
  bloc.showSession.next({
    sessionId: "s1",
    canRequest: true,
  });
  await expectation;
});
