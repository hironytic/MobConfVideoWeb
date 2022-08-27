//
// SessionDetailLogic.ts
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

import { IRDE, IRDETypes } from "../../utils/IRDE";
import { Session } from "../../entities/Session";
import { IdAndName } from "./WatchedEvents";
import { Logic } from "../../utils/LogicProvider";
import { BehaviorSubject, NEVER, Observable, Subscription } from "rxjs";
import { SessionDetailRepository } from "./SessionDetailRepository";
import { Event } from "../../entities/Event";
import { errorMessage } from "../../utils/ErrorMessage";

export interface SessionItem {
  session: Session;
  conferenceName: string;
  watchedEvents: IdAndName[];
}

export interface SessionDetailIProps {}
export interface SessionDetailRProps {}
export interface SessionDetailDProps { sessionItem: SessionItem }
export interface SessionDetailEProps { message: string }
export type SessionDetailIRDE = IRDE<SessionDetailIProps, SessionDetailRProps, SessionDetailDProps, SessionDetailEProps>;

export interface SessionDetailLogic extends Logic {
  setCurrentSession(sessionId: string): void;

  sessionDetail$: Observable<SessionDetailIRDE>;
}

export class NullSessionDetailLogic implements SessionDetailLogic {
  dispose() {}
  setCurrentSession(sessionId: string) {}
  
  sessionDetail$ = NEVER;
}

export class AppSessionDetailLogic implements SessionDetailLogic {
  sessionDetail$ = new BehaviorSubject<SessionDetailIRDE>({ type: IRDETypes.Initial });

  constructor(private readonly repository: SessionDetailRepository) {
    this.subscribeAllEvents();
  }
  
  setCurrentSession(sessionId: string) {
    if (this.latestSessionId !== sessionId) {
      this.subscribeSession(sessionId);
    }
  }

  private allEvents: Event[] = [];
  private eventsSubscription: Subscription | undefined = undefined;
  
  private subscribeAllEvents() {
    this.eventsSubscription?.unsubscribe();
    this.eventsSubscription = undefined;

    this.allEvents = [];
    this.eventsSubscription = this.repository.getAllEvents$().subscribe(
      {
        next: (events) => {
          this.allEvents = events;
          this.updateSessionDetail();
        },
        error: (err) => {
          console.log("Error at getAllEvents$ in AppRequestDetailLogic", err);
          this.allEvents = [];
          this.updateSessionDetail();
        },
      }
    );
  }

  private latestSessionId: string | undefined = undefined;
  private latestSession: Session | undefined = undefined;
  private sessionSubscription: Subscription | undefined = undefined;

  private subscribeSession(sessionId: string | undefined) {
    this.sessionSubscription?.unsubscribe();
    this.sessionSubscription = undefined;

    this.latestSessionId = sessionId;
    this.latestSession = undefined;

    if (sessionId !== undefined) {
      // Make it loading
      this.sessionDetail$.next({type: IRDETypes.Running});

      this.sessionSubscription = this.repository.getSession$(sessionId).subscribe(
        {
          next: (session: Session) => {
            this.latestSession = session;
            if (this.latestConferenceId !== session.conferenceId) {
              this.subscribeConference(session.conferenceId);
            } else {
              this.updateSessionDetail();
            }
          },
          error: (err) => {
            console.log("Error at getSession$ in AppSessionDetailLogic", err);
            this.latestSessionId = undefined;
            this.latestSession = undefined;
            this.sessionDetail$.next({ type: IRDETypes.Error, message: errorMessage(err) })
          }
        }
      );
    } else {
      this.updateSessionDetail();
    }
  }

  private latestConferenceId: string | undefined = undefined;
  private latestConferenceName: string | undefined = undefined;
  private conferenceSubscription: Subscription | undefined = undefined;

  private subscribeConference(conferenceId: string | undefined) {
    this.conferenceSubscription?.unsubscribe();
    this.conferenceSubscription = undefined;

    this.latestConferenceId = conferenceId;
    this.latestConferenceName = undefined;

    if (conferenceId !== undefined) {
      this.conferenceSubscription = this.repository.getConferenceName$(conferenceId).subscribe(
        {
          next: (conferenceName: string) => {
            this.latestConferenceName = conferenceName;
            this.updateSessionDetail();
          },
          error: (err) => {
            console.log("Error at getConferenceName$ in AppSessionDetailLogic", err);
            this.latestConferenceId = undefined;
            this.latestConferenceName = undefined;
            this.updateSessionDetail();
          }
        }
      )
    } else {
      this.updateSessionDetail();
    }
  }

  private updateSessionDetail() {
    if (this.latestSession === undefined) {
      // Still loading session.
      return;
    }

    const session = this.latestSession;
    const watchedEvents = this.allEvents
      .filter(event => session.watchedOn[event.id] !== undefined)
      .map((event): IdAndName => ({id: event.id, name: event.name}));
    
    const sessionItem: SessionItem = {
      session,
      conferenceName: this.latestConferenceName ?? "",
      watchedEvents: watchedEvents,
    };
    this.sessionDetail$.next({ type: IRDETypes.Done, sessionItem });
  }
  
  dispose() {
    this.eventsSubscription?.unsubscribe();
    this.sessionSubscription?.unsubscribe();
    this.conferenceSubscription?.unsubscribe();
  }
}