//
// RequestViewModel.test.ts
//
// Copyright (c) 2019-2022 Hironori Ichimiya <hiron@hironytic.com>
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

import { RequestRepository } from "./RequestRepository";
import { NEVER, Observable, startWith, Subject, Subscription, throwError } from "rxjs";
import { Event } from "../../entities/Event";
import { Request } from "../../entities/Request";
import {
  AppRequestViewModel,
  RequestListDProps,
  RequestListEProps,
  RequestListIRDE,
  RequestViewModel
} from "./RequestViewModel";
import { EventuallyObserver } from "../../utils/EventuallyObserver";
import { IRDEDone, IRDEError, IRDETypes } from "../../utils/IRDE";

class MockRequestRepository implements RequestRepository {
  getAllEvents$ = jest.fn(() => NEVER as Observable<Event[]>);
  getAllRequests$ = jest.fn(eventId => NEVER as Observable<Request[]>);
}

const eventData1: Event[] = [
  { id: "e1", name: "Event 1", isAccepting: false },
  { id: "e2", name: "Event 2", isAccepting: false },
];
const eventData2: Event[] = [
  { id: "e1", name: "Event 1", isAccepting: false },
  { id: "e2", name: "Event 2", isAccepting: false },
  { id: "e3", name: "Event 3", isAccepting: false },
];

const requestData1: Request[] = [
  {
    id: "r1",
    sessionId: "s1",
    title: "Request 1",
    conference: "Conference 1",
    minutes: 30,
    videoUrl: "https://example.com/video1",
    slideUrl: "https://example.com/slide1",
    memo: "",
    isWatched: true,
  },
  {
    id: "r2",
    sessionId: undefined,
    title: "Request 2",
    conference: "Conference X",
    minutes: 15,
    videoUrl: "https://example.com/video2",
    slideUrl: undefined,
    memo: "memo",
    isWatched: false,
  },
];

const requestData2: Request[] = [
  {
    id: "r3",
    sessionId: "s2",
    title: "Request 3",
    conference: "Conference 2",
    minutes: 30,
    videoUrl: "https://example.com/video3",
    slideUrl: "https://example.com/slide3",
    memo: "",
    isWatched: true,
  },
  {
    id: "r4",
    sessionId: "s2",
    title: "Request 4",
    conference: "Conference 2",
    minutes: 15,
    videoUrl: "https://example.com/video4",
    slideUrl: "https://example.com/slide4",
    memo: "",
    isWatched: true,
  },
  {
    id: "r5",
    sessionId: "s3",
    title: "Request 5",
    conference: "Conference 3",
    minutes: 15,
    videoUrl: "https://example.com/video5",
    slideUrl: "https://example.com/slide5",
    memo: "",
    isWatched: true,
  },
];

let mockRequestRepository: MockRequestRepository;
let subscription: Subscription;
let viewModel: RequestViewModel | undefined;

function createViewModel(): RequestViewModel {
  viewModel = new AppRequestViewModel(mockRequestRepository);
  return viewModel;
}

beforeEach(() => {
  mockRequestRepository = new MockRequestRepository();
  subscription = new Subscription();
  viewModel = undefined;
});

afterEach(() => {
  subscription.unsubscribe();
  if (viewModel !== undefined) {
    viewModel.dispose();
  }
});

describe("getAllEvents$", () => {
  it("emits all events", async () => {
    mockRequestRepository.getAllEvents$.mockReturnValue(NEVER.pipe(startWith(eventData1)));

    const viewModel = createViewModel();

    const observer = new EventuallyObserver<Event[]>();
    const expectation = observer.expectValue(events => {
      expect(events).toBe(eventData1);
    });

    subscription.add(viewModel.allEvents$.subscribe(observer));

    await expectation;
  });

  it("emits next all events", async () => {
    const mockSubject = new Subject<Event[]>();
    mockRequestRepository.getAllEvents$.mockReturnValue(mockSubject.pipe(startWith(eventData1)));

    const viewModel = createViewModel();

    const observer = new EventuallyObserver<Event[]>();
    const expectation1 = observer.expectValue(events => {
      expect(events).toBe(eventData1);
    });
    subscription.add(viewModel.allEvents$.subscribe(observer));
    await expectation1;

    const expectation2 = observer.expectValue(events => {
      expect(events).toBe(eventData2);
    });
    mockSubject.next(eventData2);
    await expectation2;
  });

  it("emits empty event list when failed to load them", async () => {
    mockRequestRepository.getAllEvents$.mockReturnValue(throwError(() => new Error("error")));

    const viewModel = createViewModel();

    const observer = new EventuallyObserver<Event[]>();
    const expectation = observer.expectValue(events => {
      expect(events.length).toBe(0);
    });

    subscription.add(viewModel.allEvents$.subscribe(observer));

    await expectation;
  });
});

describe("currentEventId", () => {
  it("holds current event id", () => {
    const viewModel = createViewModel();
    
    viewModel.setCurrentEventId("e3");
    expect(viewModel.currentEventId).toBe("e3");
  });
});

describe("getAllRequests$", () => {
  it("emits all requests for current event", async () => {
    mockRequestRepository.getAllEvents$.mockReturnValue(NEVER.pipe(startWith(eventData1)));
    mockRequestRepository.getAllRequests$.mockReturnValue(NEVER.pipe(startWith(requestData1)));

    const viewModel = createViewModel();

    const observer = new EventuallyObserver<RequestListIRDE>();
    const expectation = observer.expectValue(requestList => {
      expect(requestList.type).toBe(IRDETypes.Done);
      expect((requestList as IRDEDone<RequestListDProps>).requests).toBe(requestData1);
    });
    subscription.add(viewModel.requestList$.subscribe(observer));
    viewModel.setCurrentEventId("e1");
    await expectation;
    expect(mockRequestRepository.getAllRequests$.mock.calls[0][0]).toBe("e1");
  });
  
  it("emits a type of running on beginning of loading, and emits a type of done when loaded", async () => {
    mockRequestRepository.getAllEvents$.mockReturnValue(NEVER.pipe(startWith(eventData1)));
    const mockSubject = new Subject<Request[]>();
    mockRequestRepository.getAllRequests$.mockReturnValue(mockSubject);
    
    const viewModel = createViewModel();
    
    const observer = new EventuallyObserver<RequestListIRDE>();
    const expectationOfRunning = observer.expectValue(requestList => {
      expect(requestList.type).toBe(IRDETypes.Running);
    });
    subscription.add(viewModel.requestList$.subscribe(observer));
    viewModel.setCurrentEventId("e1");
    await expectationOfRunning;
    
    const expectationOfDone = observer.expectValue(requestList => {
      expect(requestList.type).toBe(IRDETypes.Done);
    });
    mockSubject.next(requestData1);
    await expectationOfDone;
  });
  
  it("reloads requests when user changes the current event", async () => {
    mockRequestRepository.getAllEvents$.mockReturnValue(NEVER.pipe(startWith(eventData1)));
    mockRequestRepository.getAllRequests$.mockImplementation(eventId => {
      switch (eventId) {
        case "e1":
          return NEVER.pipe(startWith(requestData1));
        case "e2":
          return NEVER.pipe(startWith(requestData2));
        default:
          return NEVER;
      }
    });
    
    const viewModel = createViewModel();
    
    const observer = new EventuallyObserver<RequestListIRDE>();
    const expecationOfRequestForEvent1 = observer.expectValue(requestList => {
      expect(requestList.type).toBe(IRDETypes.Done);
      expect((requestList as IRDEDone<RequestListDProps>).requests).toBe(requestData1);
    });
    subscription.add(viewModel.requestList$.subscribe(observer));
    viewModel.setCurrentEventId("e1");
    await expecationOfRequestForEvent1;
    
    const expectationOfLoadingRequestsForEvent2 = observer.expectValue(requestList => {
      expect(requestList.type).toBe(IRDETypes.Running);
    });
    
    const expectationOfLoadedRequestsForEvent2 = observer.expectValue(requestList => {
      expect(requestList.type).toBe(IRDETypes.Done);
      expect((requestList as IRDEDone<RequestListDProps>).requests).toBe(requestData2);
    });
    viewModel.setCurrentEventId("e2");
    await expectationOfLoadingRequestsForEvent2;
    await expectationOfLoadedRequestsForEvent2;
  });
  
  it("emits a type of error when failed to load request", async () => {
    const error = new Error("error occurred");
    mockRequestRepository.getAllEvents$.mockReturnValue(NEVER.pipe(startWith(eventData1)));
    mockRequestRepository.getAllRequests$.mockReturnValue(throwError(() => error));
    
    const viewModel = createViewModel();
    
    const observer = new EventuallyObserver<RequestListIRDE>();
    const expectation = observer.expectValue(requestList => {
      expect(requestList.type).toBe(IRDETypes.Error);
      expect((requestList as IRDEError<RequestListEProps>).message).toBe(error.toString());
    });
    subscription.add(viewModel.requestList$.subscribe(observer));
    viewModel.setCurrentEventId("e1");
    await expectation;
  });
  
  it("resumes from error by selecting another event", async () => {
    mockRequestRepository.getAllEvents$.mockReturnValue(NEVER.pipe(startWith(eventData1)));
    mockRequestRepository.getAllRequests$.mockImplementation(eventId => {
      switch (eventId) {
        case "e1":
          return throwError(() => new Error("failed to load requests for e1"));
        case "e2":
          return NEVER.pipe(startWith(requestData2));
        default:
          return NEVER;
      }
    });

    const viewModel = createViewModel();
    
    const observer = new EventuallyObserver<RequestListIRDE>();
    const expectationOfRequestsForEvent1 = observer.expectValue(requestList => {
      expect(requestList.type).toBe(IRDETypes.Error);
    });
    subscription.add(viewModel.requestList$.subscribe(observer));
    viewModel.setCurrentEventId("e1");
    await expectationOfRequestsForEvent1;
    
    const expectationOfRequestsForEvent2 = observer.expectValue(requestList => {
      expect(requestList.type).toBe(IRDETypes.Done);
      expect((requestList as IRDEDone<RequestListDProps>).requests).toBe(requestData2);
    });
    viewModel.setCurrentEventId("e2");
    await expectationOfRequestsForEvent2;
  });
});
