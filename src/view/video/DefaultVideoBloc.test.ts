//
// DefaultVideoBloc.test.ts
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
import DropdownState from 'src/common/DropdownState';
import DropdownStateItem from 'src/common/DropdownStateItem';
import Conference from 'src/model/Conference';
import Event from 'src/model/Event';
import Session from 'src/model/Session';
import Speaker from 'src/model/Speaker';
import SessionFilter from 'src/repository/SessionFilter';
import EventuallyObserver from 'src/test/EventuallyObserver';
import MockConferenceRepository from 'src/test/mock/MockConferenceRepository';
import MockEventRepository from 'src/test/mock/MockEventRepository';
import MockSessionRepository from 'src/test/mock/MockSessionRepository';
import DefaultVideoBloc from './DefaultVideoBloc';
import { ISessionList, ISessionListError, ISessionListLoaded, IVideoBloc, SessionListState } from './VideoBloc';

let mockConferenceRepository: MockConferenceRepository;
let mockSessionRepository: MockSessionRepository;
let mockEventRepository: MockEventRepository;
let subscription: Subscription;
let bloc: IVideoBloc;

const conferences1 = [
  new Conference("c1", "Conf 1", new Date(Date.UTC(2016, 7, 20, 1, 0))),
  new Conference("c2", "Conf 2", new Date(Date.UTC(2017, 8, 15, 8, 30))),
  new Conference("c3", "Conf 3", new Date(Date.UTC(2018, 7, 30, 9, 0))),
];

const sessions1 = [
  new Session("s1", "c1", true, {"e1": 1, "e3": 2}, "Session 1", "", new Date(Date.UTC(2018, 7, 30, 11, 0)), 30, "https://example.com/slide1", "https://example.com/video1", [
    new Speaker("Speaker 1", "speaker1", undefined),
  ]),
  new Session("s2", "c2", false, {}, "Session 2", "", new Date(Date.UTC(2018, 8, 1, 13, 0)), 30, undefined, "https://example.com/video2", [
    new Speaker("Speaker 2", "speaker2", "https://example.com/image2"),
    new Speaker("Speaker 3", undefined, "https://example.com/image3"),
  ]),
];

const events1 = [
  new Event("e3", "Event 3", true),
  new Event("e2", "Event 2", false),
  new Event("e1", "Event 1", false),
];

function createBloc() {
  bloc = DefaultVideoBloc.create(mockConferenceRepository, mockSessionRepository, mockEventRepository);
}

beforeEach(() => {
  mockConferenceRepository = new MockConferenceRepository();
  mockSessionRepository = new MockSessionRepository();
  mockEventRepository = new MockEventRepository();
  subscription = new Subscription();
  bloc = undefined!;
});

afterEach(() => {
  subscription.unsubscribe();
  if (bloc !== undefined) {
    bloc.dispose();
  }
});

it("initially expands the filter panel", async () => {
  createBloc();

  const observer = new EventuallyObserver<boolean>();
  const expectation = observer.expectValue(isExpanded => {
    expect(isExpanded).toBe(true);
  });
  subscription.add(bloc.isFilterPanelExpanded.subscribe(observer));
  await expectation;
});

it("closes or expands the filter panel by user's operation", async () => {
  createBloc();

  const observer = new EventuallyObserver<boolean>();
  const expectation1 = observer.expectValue(isExpanded => {
    expect(isExpanded).toBe(true);
  });
  subscription.add(bloc.isFilterPanelExpanded.subscribe(observer));
  await expectation1;

  const expectation2 = observer.expectValue(isExpanded => {
    expect(isExpanded).toBe(false);
  });
  bloc.expandFilterPanel.next(false);
  await expectation2;

  const expectation3 = observer.expectValue(isExpanded => {
    expect(isExpanded).toBe(true);
  });
  bloc.expandFilterPanel.next(true);
  await expectation3;
});

it("initially selects 'unspecified' for conference filter", async () => {
  mockConferenceRepository.getAllConferencesObservable.mockReturnValue(never().pipe(
    startWith(conferences1),
  ));
  createBloc();

  const observer = new EventuallyObserver<DropdownState>();
  const expectation = observer.expectValue(filterConference => {
    const unspecifiedItem = filterConference.items.find(item => item.title === "指定なし");
    expect(unspecifiedItem).not.toBeUndefined();
    expect(filterConference.value).toBe((unspecifiedItem as DropdownStateItem).value);
  });
  subscription.add(bloc.filterConference.subscribe(observer));
  await expectation;
});

it("contains conferences", async () => {
  mockConferenceRepository.getAllConferencesObservable.mockReturnValue(never().pipe(
    startWith(conferences1),
  ));
  createBloc();

  const observer = new EventuallyObserver<DropdownState>();
  const expectation = observer.expectValue(filterConference => {
    expect(filterConference.items).toHaveLength(4);
    expect(filterConference.items.map(item => item.title)).toContain("Conf 1");
    expect(filterConference.items.map(item => item.value)).toContain("c2");
  });
  subscription.add(bloc.filterConference.subscribe(observer));
  await expectation;
});

it("changes selection of conference filter by user's operation", async () => {
  mockConferenceRepository.getAllConferencesObservable.mockReturnValue(never().pipe(
    startWith(conferences1),
  ));
  createBloc();

  const observer = new EventuallyObserver<DropdownState>();
  const expectation1 = observer.expectValue(filterConference => {
    expect(filterConference.items.map(item => item.value)).toContain("c1");
  });
  subscription.add(bloc.filterConference.subscribe(observer));
  await expectation1;

  const expectation2 = observer.expectValue(filterConference => {
    expect(filterConference.value).toBe("c1");
  });
  bloc.filterConferenceChanged.next("c1");
  await expectation2;
});

it("shows '<<error>>' in conference filter", async () => {
  mockConferenceRepository.getAllConferencesObservable.mockReturnValue(throwError(new Error("Failed to load conference")));
  createBloc();

  const observer = new EventuallyObserver<DropdownState>();
  const expectation = observer.expectValue(filterConference => {
    expect(filterConference.items.map(item => item.title)).toContain("<<エラー>>");
  });
  subscription.add(bloc.filterConference.subscribe(observer));
  await expectation;
});

it("initially selects 'unspecified' for session time filter", async () => {
  createBloc();

  const observer = new EventuallyObserver<DropdownState>();
  const expectation = observer.expectValue(filterSessionTime => {
    const unspecifiedItem = filterSessionTime.items.find(item => item.title === "指定なし");
    expect(unspecifiedItem).not.toBeUndefined();
    expect(filterSessionTime.value).toBe((unspecifiedItem as DropdownStateItem).value);
  });
  subscription.add(bloc.filterSessionTime.subscribe(observer));
  await expectation;
});

it("changes selection of session time filter by user's operation", async () => {
  createBloc();

  let candidate: string = "";
  const observer = new EventuallyObserver<DropdownState>();
  const expectation1 = observer.expectValue(filterSessionTime => {
    const otherValue = filterSessionTime.items.find(item => item.value !== filterSessionTime.value);
    expect(candidate).not.toBeUndefined();
    candidate = otherValue!.value;
  });
  subscription.add(bloc.filterSessionTime.subscribe(observer));
  await expectation1;

  const expectation2 = observer.expectValue(filterSessionTime => {
    expect(filterSessionTime.value).toBe(candidate);
  });
  bloc.filterSessionTimeChanged.next(candidate);
  await expectation2;
});

it("initially shows empty keywords filter", async () => {
  createBloc();

  const observer = new EventuallyObserver<string>();
  const expectation = observer.expectValue(filterKeywords => {
    expect(filterKeywords).toBe("");
  });
  subscription.add(bloc.filterKeywords.subscribe(observer));
  await expectation;
});

it("changes the keywords filter by user's input", async () => {
  createBloc();

  const observer = new EventuallyObserver<string>();
  const expectation1 = observer.expectValue(filterKeywords => {
    expect(filterKeywords).toBe("foo");
  });
  subscription.add(bloc.filterKeywords.subscribe(observer));
  bloc.filterKeywordsChanged.next("foo");
  await expectation1;

  const expectation2 = observer.expectValue(filterKeywords => {
    expect(filterKeywords).toBe("foo bar");
  });
  bloc.filterKeywordsChanged.next("foo bar");
  await expectation2;
});

it("initially has session list which is not loaded yet", async () => {
  createBloc();

  const observer = new EventuallyObserver<ISessionList>();
  const expectation = observer.expectValue(sessionList => {
    expect(sessionList.state).toBe(SessionListState.NotLoaded);
  });
  subscription.add(bloc.sessionList.subscribe(observer));
  await expectation;

  expect(mockSessionRepository.getSessionsObservable).not.toHaveBeenCalled();  
});

it("changes the state of the session list to loading", async () => {
  createBloc();

  const observer = new EventuallyObserver<ISessionList>();
  const expectation1 = observer.expectValue(sessionList => {
    expect(sessionList.state).toBe(SessionListState.NotLoaded);
  });
  subscription.add(bloc.sessionList.subscribe(observer));
  await expectation1;

  const expectation2 = observer.expectValue(sessionList => {
    expect(sessionList.state).toBe(SessionListState.Loading);
  });
  bloc.executeFilter.next();
  await expectation2;
});

it("closes the filter panel when filter is executed", async () => {
  createBloc();

  const observer = new EventuallyObserver<boolean>();
  const expectation1 = observer.expectValue(isExpanded => {
    expect(isExpanded).toBe(true);
  });
  subscription.add(bloc.isFilterPanelExpanded.subscribe(observer));
  await expectation1;

  const expectation2 = observer.expectValue(isExpanded => {
    expect(isExpanded).toBe(false);
  });
  bloc.executeFilter.next();
  await expectation2;
});

it("passes the filter setting to the repository", async () => {
  mockConferenceRepository.getAllConferencesObservable.mockReturnValue(never().pipe(
    startWith(conferences1),
  ));
  createBloc();

  const filterConferenceObserver = new EventuallyObserver<DropdownState>();
  const expectationOfFilterConference = filterConferenceObserver.expectValue(filterConference => {
    expect(filterConference.items.map(item => item.value)).toContain("c2");
  });
  subscription.add(bloc.filterConference.subscribe(filterConferenceObserver));

  const filterSessionTimeObserver = new EventuallyObserver<DropdownState>();
  const expectationOfFilterSessionTime = filterSessionTimeObserver.expectValue(filterSessionTime => {
    expect(filterSessionTime.items.map(item => item.value)).toContain("30");
  });
  subscription.add(bloc.filterSessionTime.subscribe(filterSessionTimeObserver));

  await Promise.all([expectationOfFilterConference, expectationOfFilterSessionTime]);

  bloc.filterConferenceChanged.next("c2");
  bloc.filterSessionTimeChanged.next("30");
  bloc.filterKeywordsChanged.next("key word");

  const sessionListObserver = new EventuallyObserver<ISessionList>();
  const expectationOfLoading = sessionListObserver.expectValue(sessionList => {
    expect(sessionList.state).toBe(SessionListState.Loading);
  });
  subscription.add(bloc.sessionList.subscribe(sessionListObserver));
  bloc.executeFilter.next();
  await expectationOfLoading;

  expect(mockSessionRepository.getSessionsObservable).toHaveBeenCalledWith(new SessionFilter({
    conferenceId: "c2",
    minutes: 30,
    keywords: ["key", "word"],
  }));
});

it("shows the session list", async () => {
  mockConferenceRepository.getAllConferencesObservable.mockReturnValue(never().pipe(
    startWith(conferences1),
  ));
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(events1),
  ));
  const sessionSubject = new Subject<Session[]>();
  mockSessionRepository.getSessionsObservable.mockReturnValue(sessionSubject);
  createBloc();

  const observer = new EventuallyObserver<ISessionList>();
  const expectation1 = observer.expectValue(sessionList => {
    expect(sessionList.state).toBe(SessionListState.Loading);
  });
  subscription.add(bloc.sessionList.subscribe(observer));
  bloc.executeFilter.next();
  await expectation1;

  const expectation2 = observer.expectValue(sessionList => {
    expect(sessionList.state).toBe(SessionListState.Loaded);
    
    const loaded = sessionList as ISessionListLoaded;
    expect(loaded.sessions).toHaveLength(2);

    expect(loaded.sessions[0].session).toBe(sessions1[0]);
    expect(loaded.sessions[0].conferenceName).toBe("Conf 1");
    expect(loaded.sessions[0].watchedEvents).toEqual([
      {id: "e3", name: "Event 3"},
      {id: "e1", name: "Event 1"},
    ]);

    expect(loaded.sessions[1].session).toBe(sessions1[1]);
    expect(loaded.sessions[1].conferenceName).toBe("Conf 2");
    expect(loaded.sessions[1].watchedEvents).toEqual([]);
  });
  sessionSubject.next(sessions1);
  await expectation2;
});

it("emits the error state of session list", async () => {
  mockConferenceRepository.getAllConferencesObservable.mockReturnValue(never().pipe(
    startWith(conferences1),
  ));
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(events1),
  ));
  const sessionSubject = new Subject<Session[]>();
  mockSessionRepository.getSessionsObservable.mockReturnValue(sessionSubject);
  createBloc();

  const observer = new EventuallyObserver<ISessionList>();
  const expectation1 = observer.expectValue(sessionList => {
    expect(sessionList.state).toBe(SessionListState.Loading);
  });
  subscription.add(bloc.sessionList.subscribe(observer));
  bloc.executeFilter.next();
  await expectation1;

  const error = new Error("session load error");
  const expectation2 = observer.expectValue(sessionList => {
    expect(sessionList.state).toBe(SessionListState.Error);
    const sessionListError = sessionList as ISessionListError;
    expect(sessionListError.message).toBe(error.toString());
  });
  sessionSubject.error(error);
  await expectation2;
});
