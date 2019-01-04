//
// DefaultSessionDetailBloc.ts
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

import { combineLatest, ConnectableObservable, Observable, Observer, of, Subject, Subscription } from 'rxjs';
import { catchError, map, publishBehavior, startWith } from 'rxjs/operators';
import Conference from 'src/model/Conference';
import { IConferenceRepository } from 'src/repository/ConferenceRepository';
import { IEventRepository } from 'src/repository/EventRepository';
import { ISessionRepository } from 'src/repository/SessionRepository';
import { IIdAndName, ISessionDetail, ISessionDetailBloc, ISessionDetailError, ISessionDetailLoaded, ISessionDetailLoading, ISessionItem, SessionDetailState } from "./SessionDetailBloc";

class DefaultSessionDetailBloc implements ISessionDetailBloc {
  public static createWithSessionID(
    conferenceRepository: IConferenceRepository,
    eventRepository: IEventRepository,
    sessionRepository: ISessionRepository,
    sessionID: string,
    dialogClosed: Observer<void>,
  ) {
    const subscription = new Subscription();

    const requestClicked = new Subject<void>();

    interface IConferenceNameMap {
      [key: string]: string
    };

    function makeConferenceNameMap(conferences: Conference[]) {
      return conferences.reduce((confNameMap, conference) => {
        confNameMap[conference.id] = conference.name;
        return confNameMap;
      }, {} as IConferenceNameMap)
    }

    const conferenceNameMap = conferenceRepository.getAllConferencesObservable().pipe(
      map(makeConferenceNameMap),
    );
    const allEvents = eventRepository.getAllEventsObservable();
    const session = sessionRepository.getSessionObservable(sessionID);

    const sessionDetail = combineLatest(session, conferenceNameMap, allEvents).pipe(
      map(([sessionValue, conferenceNameMapValue, allEventsValue]) => {
        const watchedEvents = allEventsValue
          .filter(event => sessionValue.watchedOn[event.id] !== undefined)
          .map(event => ({id: event.id, name: event.name} as IIdAndName));
        return {
          state: SessionDetailState.Loaded,
          session: {
            session: sessionValue,
            conferenceName: conferenceNameMapValue[sessionValue.conferenceId],
            watchedEvents,
          } as ISessionItem,
        } as ISessionDetailLoaded;
      }),
      startWith({state: SessionDetailState.Loading} as ISessionDetailLoading),
      catchError((error) => of({
        state: SessionDetailState.Error,
        message: error.toString(),
      } as ISessionDetailError)),
      publishBehavior({
        state: SessionDetailState.NotLoaded,
      } as ISessionDetail),
    ) as ConnectableObservable<ISessionDetail>;
    subscription.add(sessionDetail.connect());

    return new DefaultSessionDetailBloc(
      subscription,
      dialogClosed,
      requestClicked,
      sessionDetail,
    );
  }

  public static createWithLoadedSession(
    sessionItem: ISessionItem,
    dialogClosed: Observer<void>,
  ) {
    const requestClicked = new Subject<void>();

    const sessionDetail = of(
      {
        state: SessionDetailState.Loaded,
        session: sessionItem,
      } as ISessionDetailLoaded
    )
    return new DefaultSessionDetailBloc(
      undefined,
      dialogClosed,
      requestClicked,
      sessionDetail,
    );
  }

  private constructor(
    private subscription: Subscription | undefined,

    // inputs
    public dialogClosed: Observer<void>,
    public requestClicked: Observer<void>,

    // outputs
    public sessionDetail: Observable<ISessionDetail>,
  ) {}

  public dispose() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }
}

export default DefaultSessionDetailBloc;
