//
// SessionViewModel.test.ts
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

import { SessionFilter, SessionRepository } from "./SessionRepository";
import { NEVER, Observable, startWith, Subscription, throwError } from "rxjs";
import { Event } from "../../entities/Event";
import { Conference } from "../../entities/Conference";
// import { Session } from "../../entities/Session";
import { AppSessionViewModel, SessionViewModel } from "./SessionViewModel";
import { EventuallyObserver } from "../../utils/EventuallyObserver";
import { DropdownState } from "../../utils/Dropdown";

class MockSessionRepository implements SessionRepository {
  getAllConferences$ = jest.fn(() => NEVER as Observable<Conference[]>);
  getAllEvents$ = jest.fn(() => NEVER as Observable<Event[]>);
  getSessions = jest.fn(async (_: SessionFilter) => ({ sessions: [], more: undefined }));
}

const conferences1: Conference[] = [
  { id: "c1", name: "Conf 1", starts: new Date(Date.UTC(2016, 7, 20, 1, 0)) },
  { id: "c2", name: "Conf 2", starts: new Date(Date.UTC(2017, 8, 15, 8, 30)) },
  { id: "c3", name: "Conf 3", starts: new Date(Date.UTC(2018, 7, 30, 9, 0)) },
];

// const sessions1: Session[] = [
//   {
//     id: "s1",
//     conferenceId: "c1",
//     watched: true,
//     watchedOn: {"e1": 1, "e3": 2},
//     title: "Session 1",
//     description: "",
//     starts: new Date(Date.UTC(2018, 7, 30, 11, 0)),
//     minutes: 30,
//     slide: "https://example.com/slide1",
//     video: "https://example.com/video1",
//     speakers: [
//       { name: "Speaker 1", twitter: "speaker1", icon: undefined }
//     ]
//   },
//   {
//     id: "s2",
//     conferenceId: "c2",
//     watched: false,
//     watchedOn: {},
//     title: "Session 2",
//     description: "",
//     starts: new Date(Date.UTC(2018, 8, 1, 13, 0)),
//     minutes: 30,
//     slide: undefined,
//     video: "https://example.com/video2",
//     speakers: [
//       { name: "Speaker 2", twitter: "speaker2", icon: "https://example.com/image2" },
//       { name: "Speaker 3", twitter: undefined, icon: "https://example.com/image3" },
//     ]
//   },
// ];
//
// const events1: Event[] = [
//   { id: "e3", name: "Event 3", isAccepting: true },
//   { id: "e2", name: "Event 2", isAccepting: false },
//   { id: "e1", name: "Event 1", isAccepting: false },
// ];

let mockSessionRepository: MockSessionRepository;
let subscription: Subscription;
let viewModel: SessionViewModel | undefined;

function createViewModel(): SessionViewModel {
  viewModel = new AppSessionViewModel(mockSessionRepository);
  return viewModel;
}

beforeEach(() => {
  mockSessionRepository = new MockSessionRepository();
  subscription = new Subscription();
  viewModel = undefined;
});

afterEach(() => {
  subscription.unsubscribe();
  if (viewModel !== undefined) {
    viewModel.dispose();
  }
});

describe("expand filter panel", () => {
  it("initially expands", async () => {
    const viewModel = createViewModel();
    
    const observer = new EventuallyObserver<boolean>();
    const expectation = observer.expectValue(isExpanded => {
      expect(isExpanded).toBe(true);
    });
    subscription.add(viewModel.isFilterPanelExpanded$.subscribe(observer));
    await expectation;
  });
  
  it("closes or expands by user's operation", async () => {
    const viewModel = createViewModel();
    
    const observer = new EventuallyObserver<boolean>();
    const expectation1 = observer.expectValue(isExpanded => {
      expect(isExpanded).toBe(true);
    });
    subscription.add(viewModel.isFilterPanelExpanded$.subscribe(observer));
    await expectation1;
    
    const expectation2 = observer.expectValue(isExpanded => {
      expect(isExpanded).toBe(false);
    });
    viewModel.expandFilterPanel(false);
    await expectation2;
    
    const expectation3 = observer.expectValue(isExpanded => {
      expect(isExpanded).toBe(true);
    });
    viewModel.expandFilterPanel(true);
    await expectation3;
  });
});

describe("conference filter", () => {
  it("initially selects 'unspecified'", async () => {
    mockSessionRepository.getAllConferences$.mockReturnValue(NEVER.pipe(
      startWith(conferences1),
    ));
    const viewModel = createViewModel();
    
    const observer = new EventuallyObserver<DropdownState>();
    const expectation = observer.expectValue(filterConference => {
      const unspecifiedItem = filterConference.items.find(item => item.title === "指定なし");
      expect(unspecifiedItem).not.toBeUndefined();
      expect(filterConference.value).toBe(unspecifiedItem!.value);
    });
    subscription.add(viewModel.filterConference$.subscribe(observer));
    await expectation;
  });
  
  it("contains conferences", async () => {
    mockSessionRepository.getAllConferences$.mockReturnValue(NEVER.pipe(
      startWith(conferences1),
    ));
    const viewModel = createViewModel();

    const observer = new EventuallyObserver<DropdownState>();
    const expectation = observer.expectValue(filterConference => {
      expect(filterConference.items).toHaveLength(4);
      expect(filterConference.items.map(item => item.title)).toContain("Conf 1");
      expect(filterConference.items.map(item => item.value)).toContain("c2");
    });
    subscription.add(viewModel.filterConference$.subscribe(observer));
    await expectation;
  });
  
  it("changes selection by user's operation", async () => {
    mockSessionRepository.getAllConferences$.mockReturnValue(NEVER.pipe(
      startWith(conferences1),
    ));
    const viewModel = createViewModel();

    const observer = new EventuallyObserver<DropdownState>();
    const expectation1 = observer.expectValue(filterConference => {
      expect(filterConference.items.map(item => item.value)).toContain("c1");
    });
    subscription.add(viewModel.filterConference$.subscribe(observer));
    await expectation1;

    const expectation2 = observer.expectValue(filterConference => {
      expect(filterConference.value).toBe("c1");
    });
    viewModel.filterConferenceChanged("c1");
    await expectation2;
  });
  
  it("shows '<<error>>'", async () => {
    mockSessionRepository.getAllConferences$.mockReturnValue(throwError(() => new Error("Failed to load conference")));
    const viewModel = createViewModel();

    const observer = new EventuallyObserver<DropdownState>();
    const expectation1 = observer.expectValue(filterConference => {
      expect(filterConference.items.map(item => item.title)).toContain("<<エラー>>");
    });
    subscription.add(viewModel.filterConference$.subscribe(observer));
    await expectation1;
  });
});

describe("session time filter", () => {
  it("initially selects 'unspecified'", async () => {
    const viewModel = createViewModel();

    const observer = new EventuallyObserver<DropdownState>();
    const expectation = observer.expectValue(filterSessionTime => {
      const unspecifiedItem = filterSessionTime.items.find(item => item.title === "指定なし");
      expect(unspecifiedItem).not.toBeUndefined();
      expect(filterSessionTime.value).toBe(unspecifiedItem!.value);
    });
    subscription.add(viewModel.filterSessionTime$.subscribe(observer));
    await expectation;
  });
  
  it("changes selection by user's operation", async () => {
    const viewModel = createViewModel();

    let candidate: string = "";
    const observer = new EventuallyObserver<DropdownState>();
    const expectation1 = observer.expectValue(filterSessionTime => {
      const otherValue = filterSessionTime.items.find(item => item.value !== filterSessionTime.value);
      expect(otherValue).not.toBeUndefined();
      candidate = otherValue!.value;
    });
    subscription.add(viewModel.filterSessionTime$.subscribe(observer));
    await expectation1;
    
    const expectation2 = observer.expectValue(filterSessionTime => {
      expect(filterSessionTime.value).toBe(candidate);
    });
    viewModel.filterSessionTimeChanged(candidate);
    await expectation2;
  });
});

describe("keywords filter", () => {
  it("initially shows empty", async () => {
    const viewModel = createViewModel();
    
    const observer = new EventuallyObserver<string>();
    const expectation = observer.expectValue(filterKeywords => {
      expect(filterKeywords).toBe("");
    });
    subscription.add(viewModel.filterKeywords$.subscribe(observer));
    await expectation;
  });
  
  it("changes the keywords by user's input", async () => {
    const viewModel = createViewModel();

    const observer = new EventuallyObserver<string>();
    const expectation1 = observer.expectValue(filterKeywords => {
      expect(filterKeywords).toBe("foo");
    });
    subscription.add(viewModel.filterKeywords$.subscribe(observer));
    viewModel.filterKeywordsChanged("foo");
    await expectation1;

    const expectation2 = observer.expectValue(filterKeywords => {
      expect(filterKeywords).toBe("foo bar");
    });
    viewModel.filterKeywordsChanged("foo bar");
    await expectation2;
  });
});
