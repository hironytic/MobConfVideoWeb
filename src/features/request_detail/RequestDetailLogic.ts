//
// RequestDetailLogic.ts
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

import { IRDE, IRDETypes } from "../../utils/IRDE"
import { Session, Speaker } from "../../entities/Session"
import { IdAndName } from "../session_detail/WatchedEvents"
import { BehaviorSubject, NEVER, Observable, Subscription } from "rxjs"
import { Logic } from "../../utils/LogicProvider"
import { RequestDetailRepository } from "./RequestDetailRepository"
import { Event } from "../../entities/Event"
import { Request } from "../../entities/Request"
import { errorMessage } from "../../utils/ErrorMessage"

export interface RequestDetail {
  conference: string
  minutes: number | undefined
  title: string
  watchedEvents: IdAndName[] | undefined
  description: string | undefined
  speakers: Speaker[] | undefined
  slideUrl: string | undefined
  videoUrl: string | undefined
}

export interface RequestDetailIProps {}
export interface RequestDetailRProps {}
export interface RequestDetailDProps { requestDetail: RequestDetail }
export interface RequestDetailEProps { message: string }
export type RequestDetailIRDE = IRDE<RequestDetailIProps, RequestDetailRProps, RequestDetailDProps, RequestDetailEProps>

export interface RequestDetailLogic extends Logic {
  setCurrentRequest(eventId: string, requestId: string): void
  makeItWatched(): void
  makeItUnwatched(): void
  
  isWatched$: Observable<boolean | undefined>
  requestDetail$: Observable<RequestDetailIRDE>
  isAdmin$: Observable<boolean>
}

export class NullRequestDetailLogic implements RequestDetailLogic {
  dispose() {}
  setCurrentRequest(eventId: string, requestId: string): void {}

  makeItWatched(): void {}
  makeItUnwatched(): void {}

  isWatched$ = NEVER
  requestDetail$ = NEVER
  isAdmin$ = NEVER
}

export class AppRequestDetailLogic implements RequestDetailLogic {
  isWatched$ = new BehaviorSubject<boolean | undefined>(undefined)
  requestDetail$ = new BehaviorSubject<RequestDetailIRDE>({ type: IRDETypes.Initial })
  
  constructor(private readonly repository: RequestDetailRepository) {
    this.subscribeAllEvents()
  }

  setCurrentRequest(eventId: string, requestId: string) {
    if (this.latestEventId !== eventId || this.latestRequestId !== requestId) {
      this.subscribeRequest(eventId, requestId)
    }
  }
  
  private allEvents: Event[] = []
  private eventsSubscription: Subscription | undefined = undefined
  
  private subscribeAllEvents() {
    this.eventsSubscription?.unsubscribe()
    this.eventsSubscription = undefined
    
    this.allEvents = []
    this.eventsSubscription = this.repository.getAllEvents$().subscribe(
      {
        next: (events) => {
          this.allEvents = events
          this.updateRequestDetail()
        },
        error: (err) => {
          console.log("Error at getAllEvents$ in AppRequestDetailLogic", err)
          this.allEvents = []
          this.updateRequestDetail()
        },
      }
    )
  }
  
  private latestEventId: string | undefined = undefined
  private latestRequestId: string | undefined = undefined
  private latestRequest: Request | undefined = undefined
  private requestSubscription: Subscription | undefined = undefined
  
  private subscribeRequest(eventId: string, requestId: string) {
    this.requestSubscription?.unsubscribe()
    this.requestSubscription = undefined

    this.latestEventId = eventId
    this.latestRequestId = requestId
    this.latestRequest = undefined

    // Make it loading
    this.requestDetail$.next({ type: IRDETypes.Running })

    this.requestSubscription = this.repository.getRequest$(eventId, requestId).subscribe(
      {
        next: (request) => {
          this.latestRequest = request
          this.isWatched$.next(request.isWatched)
          if (request.sessionId !== this.latestSessionId) {
            this.subscribeSession(request.sessionId)
          } else {
            this.updateRequestDetail()
          }
        },
        error: (err) => {
          console.log("Error at getRequest$ in AppRequestDetailLogic", err)
          this.latestEventId = undefined
          this.latestRequestId = undefined
          this.latestRequest = undefined
          this.requestDetail$.next({ type: IRDETypes.Error, message: errorMessage(err) })
        }
      }
    )
  }

  private latestSessionId: string | undefined = undefined
  private latestSession: Session | undefined = undefined
  private sessionSubscription: Subscription | undefined = undefined
  
  private subscribeSession(sessionId: string | undefined) {
    this.sessionSubscription?.unsubscribe()
    this.sessionSubscription = undefined
    
    this.latestSessionId = sessionId
    this.latestSession = undefined
    
    if (sessionId !== undefined) {
      // Make it loading
      this.requestDetail$.next({type: IRDETypes.Running})

      this.sessionSubscription = this.repository.getSession$(sessionId).subscribe(
        {
          next: (session: Session) => {
            this.latestSession = session
            if (this.latestConferenceId !== session.conferenceId) {
              this.subscribeConference(session.conferenceId)
            } else {
              this.updateRequestDetail()
            }
          },
          error: (err) => {
            console.log("Error at getSession$ in AppRequestDetailLogic", err)
            this.latestSessionId = undefined
            this.latestSession = undefined
            this.requestDetail$.next({ type: IRDETypes.Error, message: errorMessage(err) })
          }
        }
      )
    } else {
      this.updateRequestDetail()
    }
  }
  
  private latestConferenceId: string | undefined = undefined
  private latestConferenceName: string | undefined = undefined
  private conferenceSubscription: Subscription | undefined = undefined
  
  private subscribeConference(conferenceId: string | undefined) {
    this.conferenceSubscription?.unsubscribe()
    this.conferenceSubscription = undefined
    
    this.latestConferenceId = conferenceId
    this.latestConferenceName = undefined
    
    if (conferenceId !== undefined) {
      this.conferenceSubscription = this.repository.getConferenceName$(conferenceId).subscribe(
        {
          next: (conferenceName: string) => {
            this.latestConferenceName = conferenceName
            this.updateRequestDetail()
          },
          error: (err) => {
            console.log("Error at getConferenceName$ in AppRequestDetailLogic", err)
            this.latestConferenceId = undefined
            this.latestConferenceName = undefined
            this.updateRequestDetail()
          }
        }
      )
    } else {
      this.updateRequestDetail()
    }
  }
  
  private updateRequestDetail() {
    if (this.latestRequest === undefined) {
      // Still loading request.
      return
    }
    if (this.latestRequest.sessionId !== undefined && this.latestSession === undefined) {
      // Still loading linked session.
      return
    }

    const requestDetail = ((): RequestDetail => {
      if (this.latestSession === undefined) {
        const request = this.latestRequest
        return {
          conference: request.conference,
          minutes: request.minutes,
          title: request.title,
          watchedEvents: undefined,
          description: undefined,
          speakers: undefined,
          slideUrl: request.slideUrl,
          videoUrl: request.videoUrl,
        }
      } else {
        const session = this.latestSession
        const watchedEvents = this.allEvents
          .filter(event => session.watchedOn[event.id] !== undefined)
          .map((event): IdAndName => ({id: event.id, name: event.name}))
        return {
          conference: this.latestConferenceName ?? "",
          minutes: session.minutes,
          title: session.title,
          watchedEvents: watchedEvents,
          description: session.description,
          speakers: session.speakers,
          slideUrl: session.slide,
          videoUrl: session.video,
        }
      }
    })()
    this.requestDetail$.next({ type: IRDETypes.Done, requestDetail })
  }

  dispose() {
    this.eventsSubscription?.unsubscribe()
    this.requestSubscription?.unsubscribe()
    this.sessionSubscription?.unsubscribe()
    this.conferenceSubscription?.unsubscribe()
  }

  get isAdmin$(): Observable<boolean> {
    return this.repository.isAdmin$()
  }

  makeItWatched() {
    if (this.latestEventId !== undefined && this.latestRequestId !== undefined) {
      this.repository.updateRequestWatched(this.latestEventId, this.latestRequestId, true)
    }
  }
  
  makeItUnwatched() {
    if (this.latestEventId !== undefined && this.latestRequestId !== undefined) {
      this.repository.updateRequestWatched(this.latestEventId, this.latestRequestId, false)
    }
  }
}
