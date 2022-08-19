//
// RequestDetailLogic.test.ts
//
// Copyright (c) 2022 Hironori Ichimiya <hiron@hironytic.com>
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

import { RequestDetailRepository } from "./RequestDetailRepository";
import { NEVER, startWith, Subscription, throwError } from "rxjs";
import { Request } from "../../entities/Request";
import { Session } from "../../entities/Session";
import { Event } from "../../entities/Event";
import { AppRequestDetailLogic, RequestDetail, RequestDetailIRDE, RequestDetailLogic } from "./RequestDetailLogic";
import { EventuallyObserver } from "../../utils/EventuallyObserver";
import { IRDETypes } from "../../utils/IRDE";
import { errorMessage } from "../../utils/ErrorMessage";

const request1 = {
  id: "r1",
  sessionId: "s1",
  title: "Request 1",
  conference: "Conference 1",
  minutes: 30,
  videoUrl: "https://example.com/video1",
  slideUrl: "https://example.com/slide1",
  memo: "",
  isWatched: true,
} as Request;

const request2 = {
  id: "r2",
  sessionId: undefined,
  title: "Request 2",
  conference: "Conference X",
  minutes: 15,
  videoUrl: "https://example.com/video2",
  slideUrl: undefined,
  memo: "memo",
  isWatched: false,
} as Request;

const session1 = {
  id: "s1",
  conferenceId: "c1",
  watched: true,
  watchedOn: {"e1": 1, "e3": 2},
  title: "Session 1",
  description: "Description about session 1",
  starts: new Date(Date.UTC(2018, 7, 30, 11, 0)),
  minutes: 40,
  slide: "https://example.com/slideS1",
  video: "https://example.com/videoS1",
  speakers: [
    { name: "Speaker 1", twitter: "speaker1", icon: undefined }
  ]
} as Session;

const eventList1 = [
  { id: "e1", name: "Event 1", isAccepting: false },
  { id: "e2", name: "Event 2", isAccepting: false },
  { id: "e3", name: "Event 3", isAccepting: false },
] as Event[];

const conferenceName1 = "Conf 1";

class MockRequestDetailRepository implements RequestDetailRepository {
  getRequest$ = jest.fn((_eventId: string, _requestId: string) => NEVER.pipe(startWith(request1)));
  getSession$ = jest.fn((_sessionId: string) => NEVER.pipe(startWith(session1)));
  getAllEvents$ = jest.fn(() => NEVER.pipe(startWith(eventList1)));
  getConferenceName$ = jest.fn((_conferenceId: string) => NEVER.pipe(startWith(conferenceName1)));
}

let mockRequestDetailRepository: MockRequestDetailRepository;
let subscription: Subscription;
let logic: RequestDetailLogic | undefined;

function createLogic(): RequestDetailLogic {
  logic = new AppRequestDetailLogic(mockRequestDetailRepository);
  return logic;
}

beforeEach(() => {
  mockRequestDetailRepository = new MockRequestDetailRepository();
  subscription = new Subscription();
  logic = undefined;
});

afterEach(() => {
  subscription.unsubscribe();
  if (logic !== undefined) {
    logic.dispose();
  }
});

describe("request detail", () => {
  it("should change to be loading", async () => {
    const logic = createLogic();

    const observer = new EventuallyObserver<RequestDetailIRDE>();
    const expectation1 = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Initial);
    });
    subscription.add(logic.requestDetail$.subscribe(observer));
    await expectation1;
    
    const expectation2 = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Running);
    });
    logic.setCurrentRequest("e1", "r1");
    await expectation2;
  });
  
  it("should show detail info about request that is linked to session", async () => {
    const logic = createLogic();

    let requestDetail = {} as RequestDetail;
    const observer = new EventuallyObserver<RequestDetailIRDE>();
    const expectation = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Done);
      if (irde.type === IRDETypes.Done) {
        requestDetail = irde.requestDetail;
      }
    });
    subscription.add(logic.requestDetail$.subscribe(observer));

    logic.setCurrentRequest("e1", "r1");
    await expectation;

    expect(requestDetail.conference).toBe("Conf 1");
    expect(requestDetail.minutes).toBe(40);
    expect(requestDetail.title).toBe("Session 1");
    expect(requestDetail.watchedEvents).toEqual([
      { id: "e1", name: "Event 1"},
      { id: "e3", name: "Event 3" }
    ]);
    expect(requestDetail.description).toBe("Description about session 1");
    expect(requestDetail.speakers).toEqual([
      { name: "Speaker 1", twitter: "speaker1", icon: undefined }
    ]);
    expect(requestDetail.slideUrl).toBe("https://example.com/slideS1");
    expect(requestDetail.videoUrl).toBe("https://example.com/videoS1");
  });

  it("should show detail info about request that is not linked to session", async () => {
    mockRequestDetailRepository.getRequest$.mockReturnValue(NEVER.pipe(startWith(request2)));
    const logic = createLogic();

    let requestDetail = {} as RequestDetail;
    const observer = new EventuallyObserver<RequestDetailIRDE>();
    const expectation = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Done);
      if (irde.type === IRDETypes.Done) {
        requestDetail = irde.requestDetail;
      }
    });
    subscription.add(logic.requestDetail$.subscribe(observer));

    logic.setCurrentRequest("e1", "r2");
    await expectation;

    expect(requestDetail.conference).toBe("Conference X");
    expect(requestDetail.minutes).toBe(15);
    expect(requestDetail.title).toBe("Request 2");
    expect(requestDetail.watchedEvents).toBeUndefined();
    expect(requestDetail.description).toBeUndefined();
    expect(requestDetail.speakers).toBeUndefined();
    expect(requestDetail.slideUrl).toBeUndefined();
    expect(requestDetail.videoUrl).toBe("https://example.com/video2");
  });
  
  it("should show error when failed to retrieve request", async () => {
    const error = new Error("failed to load request for r1");
    mockRequestDetailRepository.getRequest$.mockReturnValue(throwError(() => error));
    const logic = createLogic();

    let message = "";
    const observer = new EventuallyObserver<RequestDetailIRDE>();
    const expectation = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Error);
      if (irde.type === IRDETypes.Error) {
        message = irde.message;
      }
    });
    subscription.add(logic.requestDetail$.subscribe(observer));

    logic.setCurrentRequest("e1", "r1");
    await expectation;

    expect(message).toBe(errorMessage(error));
  });
  
  it("should show error when failed to retrieve session which is linked to request", async () => {
    const error = new Error("failed to load session for s1");
    mockRequestDetailRepository.getSession$.mockReturnValue(throwError(() => error));
    const logic = createLogic();

    let message = "";
    const observer = new EventuallyObserver<RequestDetailIRDE>();
    const expectation = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Error);
      if (irde.type === IRDETypes.Error) {
        message = irde.message;
      }
    });
    subscription.add(logic.requestDetail$.subscribe(observer));

    logic.setCurrentRequest("e1", "r1");
    await expectation;

    expect(message).toBe(errorMessage(error));
  });
  
  it("should not show error when failed to retrieve conference", async () => {
    const error = new Error("failed to load conference name for c1");
    mockRequestDetailRepository.getConferenceName$.mockReturnValue(throwError(() => error));
    const logic = createLogic();

    let requestDetail = {} as RequestDetail;
    const observer = new EventuallyObserver<RequestDetailIRDE>();
    const expectation = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Done);
      if (irde.type === IRDETypes.Done) {
        requestDetail = irde.requestDetail;
      }
    });
    subscription.add(logic.requestDetail$.subscribe(observer));

    logic.setCurrentRequest("e1", "r1");
    await expectation;

    expect(requestDetail.conference).toBe("");
  });
});
