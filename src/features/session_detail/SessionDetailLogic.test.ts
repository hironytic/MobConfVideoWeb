//
// SessionDetailLogic.test.ts
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

import { Event } from "../../entities/Event"
import { Session } from "../../entities/Session"
import { SessionDetailRepository } from "./SessionDetailRepository"
import { NEVER, Observable, startWith, Subscription, throwError } from "rxjs"
import { AppSessionDetailLogic, SessionDetailIRDE, SessionDetailLogic, SessionItem } from "./SessionDetailLogic"
import { EventuallyObserver } from "../../utils/EventuallyObserver"
import { IRDETypes } from "../../utils/IRDE"
import { errorMessage } from "../../utils/ErrorMessage"

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
} as Session

const eventList1 = [
  { id: "e1", name: "Event 1", isAccepting: false },
  { id: "e2", name: "Event 2", isAccepting: false },
  { id: "e3", name: "Event 3", isAccepting: false },
] as Event[]

const conferenceName1 = "Conf 1"

class MockSessionDetailRepository implements SessionDetailRepository {
  getSession$ = jest.fn((sessionId: string): Observable<Session> => NEVER.pipe(startWith(session1)))
  getAllEvents$ = jest.fn((): Observable<Event[]> => NEVER.pipe(startWith(eventList1)))
  getConferenceName$ = jest.fn((conferenceId: string): Observable<string> => NEVER.pipe(startWith(conferenceName1)))
}

let mockSessionDetailRepository: MockSessionDetailRepository
let subscription: Subscription
let logic: SessionDetailLogic | undefined

function createLogic(): SessionDetailLogic {
  logic = new AppSessionDetailLogic(mockSessionDetailRepository)
  return logic
}

beforeEach(() => {
  mockSessionDetailRepository = new MockSessionDetailRepository()
  subscription = new Subscription()
  logic = undefined
})

afterEach(() => {
  subscription.unsubscribe()
  if (logic !== undefined) {
    logic.dispose()
  }
})

describe("session detail", () => {
  it("should change to be loading", async () => {
    const logic = createLogic()

    const observer = new EventuallyObserver<SessionDetailIRDE>()
    const expectation1 = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Initial)
    })
    subscription.add(logic.sessionDetail$.subscribe(observer))
    await expectation1

    const expectation2 = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Running)
    })
    logic.setCurrentSession("s1")
    await expectation2
  })

  it("should show detail info about session", async () => {
    const logic = createLogic()

    let sessionItem = {} as SessionItem
    const observer = new EventuallyObserver<SessionDetailIRDE>()
    const expectation = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Done)
      if (irde.type === IRDETypes.Done) {
        sessionItem = irde.sessionItem
      }
    })
    subscription.add(logic.sessionDetail$.subscribe(observer))

    logic.setCurrentSession("s1")
    await expectation

    expect(sessionItem.session).toEqual(session1)
    expect(sessionItem.conferenceName).toBe("Conf 1")
    expect(sessionItem.watchedEvents).toEqual([
      { id: "e1", name: "Event 1"},
      { id: "e3", name: "Event 3" }
    ])
  })

  it("should show error when failed to retrieve session", async () => {
    const error = new Error("failed to load session for s1")
    mockSessionDetailRepository.getSession$.mockReturnValue(throwError(() => error))
    const logic = createLogic()

    let message = ""
    const observer = new EventuallyObserver<SessionDetailIRDE>()
    const expectation = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Error)
      if (irde.type === IRDETypes.Error) {
        message = irde.message
      }
    })
    subscription.add(logic.sessionDetail$.subscribe(observer))

    logic.setCurrentSession("s1")
    await expectation

    expect(message).toBe(errorMessage(error))
  })

  it("should not show error when failed to retrieve conference", async () => {
    const error = new Error("failed to load conference name for c1")
    mockSessionDetailRepository.getConferenceName$.mockReturnValue(throwError(() => error))
    const logic = createLogic()

    let sessionItem = {} as SessionItem
    const observer = new EventuallyObserver<SessionDetailIRDE>()
    const expectation = observer.expectValue(irde => {
      expect(irde.type).toBe(IRDETypes.Done)
      if (irde.type === IRDETypes.Done) {
        sessionItem = irde.sessionItem
      }
    })
    subscription.add(logic.sessionDetail$.subscribe(observer))

    logic.setCurrentSession("s1")
    await expectation

    expect(sessionItem.conferenceName).toBe("")
  })
})
