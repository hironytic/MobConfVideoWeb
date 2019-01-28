//
// DefaultRequestBloc.test.ts
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
import Event from 'src/model/Event';
import Request from 'src/model/Request';
import EventuallyObserver from 'src/test/EventuallyObserver';
import MockEventRepository from 'src/test/mock/MockEventRepository';
import MockRequestRepository from 'src/test/mock/MockRequestRepository';
import DefaultRequestBloc from "./DefaultRequestBloc";
import { IRequestBloc, IRequestList, IRequestListError, IRequestListLoaded, RequestListState } from './RequestBloc';

let mockEventRepository: MockEventRepository;
let mockRequestRepository: MockRequestRepository;
let subscription: Subscription;
let bloc: IRequestBloc | undefined;

const eventData1 = [
  new Event("e1", "Event 1", false),
  new Event("e2", "Event 2", false),
];
const eventData2 = [
  new Event("e1", "Event 1", false),
  new Event("e2", "Event 2", false),
  new Event("e3", "Event 3", false)
];

const requestData1 = [
  new Request("r1", "s1", "Request 1", "Conference 1", 30, "https://example.com/video1", "https://example.com/slide1", "", true),
  new Request("r2", undefined, "Request 2", "Conference X", 15, "https://example.com/video2", undefined, "memo", false),
];
const requestData2 = [
  new Request("r3", "s2", "Request 3", "Conference 2", 30, "https://example.com/video3", "https://example.com/slide3", "", true),
  new Request("r4", "s2", "Request 4", "Conference 2", 15, "https://example.com/video4", "https://example.com/slide4", "", true),
  new Request("r5", "s3", "Request 5", "Conference 3", 15, "https://example.com/video4", "https://example.com/slide5", "", true),
];

beforeEach(() => {
  mockEventRepository = new MockEventRepository();
  mockRequestRepository = new MockRequestRepository();
  subscription = new Subscription();
  bloc = undefined;
});

afterEach(() => {
  subscription.unsubscribe();
  if (bloc) {
    bloc.dispose();
  }
})

it("emits all events", async () => {
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(eventData1),
  ));

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<Event[]>();
  const expectation = observer.expectValue(events => {
    expect(events).toBe(eventData1);
  });

  subscription.add(bloc.allEvents.subscribe(observer));

  await expectation;
});

it("emits next all events", async () => {
  const mockSubject = new Subject<Event[]>();
  mockEventRepository.getAllEventsObservable.mockReturnValue(mockSubject.pipe(
    startWith(eventData1),
  ));

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<Event[]>();
  const expectation1 = observer.expectValue(events => {
    expect(events).toBe(eventData1);
  });
  subscription.add(bloc.allEvents.subscribe(observer));
  await expectation1;

  const expectation2 = observer.expectValue(events => {
    expect(events).toBe(eventData2);
  });
  mockSubject.next(eventData2);
  await expectation2;
});

it("initially shows the first event", async() => {
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(eventData2),
  ));

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<string | false>();
  const expectation = observer.expectValue(eventId => {
    expect(eventId).toBe("e1");
  });
  subscription.add(bloc.currentEventId.subscribe(observer));
  await expectation;
});

it("changes the current event by user's selection", async() => {
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(eventData2),
  ));

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<string | false>();
  subscription.add(bloc.currentEventId.subscribe(observer));

  const expectation = observer.expectValue(eventId => {
    expect(eventId).toBe("e3");
  });

  bloc.currentEventIdChanged.next("e3");
  await expectation;
});

it("emits empty event list when failed to load them", async() => {
  mockEventRepository.getAllEventsObservable.mockReturnValue(throwError(new Error("error")));

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<Event[]>();
  const expectation = observer.expectValue(events => {
    expect(events.length).toBe(0);
  });
  subscription.add(bloc.allEvents.subscribe(observer));
  await expectation;
});

it("emits requests for current event", async() => {
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(eventData1),
  ));
  mockRequestRepository.getAllRequestsObservable.mockReturnValue(never().pipe(
    startWith(requestData1),
  ));

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<IRequestList>();
  const expectation = observer.expectValue(requestList => {
    expect(requestList.state).toBe(RequestListState.Loaded);
    expect((requestList as IRequestListLoaded).requests).toBe(requestData1);
  });
  subscription.add(bloc.requestList.subscribe(observer));
  await expectation;
  expect(mockRequestRepository.getAllRequestsObservable.mock.calls[0][0]).toBe("e1");
});

it("emits a state of loading requests when loading", async() => {
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(eventData1),
  ));
  const mockSubject = new Subject<Request[]>();
  mockRequestRepository.getAllRequestsObservable.mockReturnValue(mockSubject);

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<IRequestList>();
  const expectationOfLoading = observer.expectValue(requestList => {
    expect(requestList.state).toBe(RequestListState.Loading);
  });
  subscription.add(bloc.requestList.subscribe(observer));
  await expectationOfLoading;

  const expectationOfLoaded = observer.expectValue(requestList => {
    expect(requestList.state).toBe(RequestListState.Loaded);
  });

  mockSubject.next(requestData1);
  await expectationOfLoaded;
});

it("reloads requests when user changes the current event", async() => {
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(eventData1),
  ));
  mockRequestRepository.getAllRequestsObservable.mockImplementation((eventId: string) => {
    switch (eventId) {
      case "e1":
        return never().pipe(startWith(requestData1));
      case "e2":
        return never().pipe(startWith(requestData2));
      default:
        return never();
    }
  });

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<IRequestList>();
  const expectationOfRequestsForEvent1 = observer.expectValue(requestList => {
    expect(requestList.state).toBe(RequestListState.Loaded);
    expect((requestList as IRequestListLoaded).requests).toBe(requestData1);
  });
  subscription.add(bloc.requestList.subscribe(observer));
  await expectationOfRequestsForEvent1;

  const expectationOfLoadingRequestsForEvent2 = observer.expectValue(requestList => {
    expect(requestList.state).toBe(RequestListState.Loading);
  });

  const expectationOfLoadedRequestsForEvent2 = observer.expectValue(requestList => {
    expect(requestList.state).toBe(RequestListState.Loaded);
    expect((requestList as IRequestListLoaded).requests).toBe(requestData2);
  });

  bloc.currentEventIdChanged.next("e2");
  await expectationOfLoadingRequestsForEvent2;
  await expectationOfLoadedRequestsForEvent2;
});

it("emits a state of error when failed to load request", async () => {
  const error = new Error("error occured");
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(eventData1),
  ));
  mockRequestRepository.getAllRequestsObservable.mockReturnValue(throwError(error));

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<IRequestList>();
  const expectation = observer.expectValue(requestList => {
    expect(requestList.state).toBe(RequestListState.Error);
    expect((requestList as IRequestListError).message).toBe(error.toString());
  });
  subscription.add(bloc.requestList.subscribe(observer));
  await expectation;
});

it("resumes from error by selecting another event", async () => {
  mockEventRepository.getAllEventsObservable.mockReturnValue(never().pipe(
    startWith(eventData1),
  ));
  mockRequestRepository.getAllRequestsObservable.mockImplementation((eventId: string) => {
    switch (eventId) {
      case "e1":
        return throwError(new Error("failed to load requests for e1"));
      case "e2":
        return never().pipe(startWith(requestData2));
      default:
        return never();
    }
  });

  bloc = DefaultRequestBloc.create(mockEventRepository, mockRequestRepository);

  const observer = new EventuallyObserver<IRequestList>();
  const expectationOfRequestsForEvent1 = observer.expectValue(requestList => {
    expect(requestList.state).toBe(RequestListState.Error);
  });
  subscription.add(bloc.requestList.subscribe(observer));
  await expectationOfRequestsForEvent1;

  const expectationOfRequestsForEvent2 = observer.expectValue(requestList => {
    expect(requestList.state).toBe(RequestListState.Loaded);
    expect((requestList as IRequestListLoaded).requests).toBe(requestData2);
  });

  bloc.currentEventIdChanged.next("e2");
  await expectationOfRequestsForEvent2;
});
