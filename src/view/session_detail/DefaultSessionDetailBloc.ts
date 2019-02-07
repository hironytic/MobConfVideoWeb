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

import { ConnectableObservable, merge, Observable, Observer, of, Subject, Subscription } from 'rxjs';
import { catchError, map, publishBehavior, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import Conference from 'src/model/Conference';
import { IConferenceRepository } from 'src/repository/ConferenceRepository';
import { IEventRepository } from 'src/repository/EventRepository';
import { ISessionRepository } from 'src/repository/SessionRepository';
import { IIdAndName, ISessionDetail, ISessionDetailBloc, ISessionItem, IShowSessionParam, SessionDetailState } from "./SessionDetailBloc";

class DefaultSessionDetailBloc implements ISessionDetailBloc {
  public static create(
    conferenceRepository: IConferenceRepository,
    eventRepository: IEventRepository,
    sessionRepository: ISessionRepository,
  ) {
    const subscription = new Subscription();

    const showSession = new Subject<IShowSessionParam>();
    const dialogClosed = new Subject<void>();

    const dialogOpen = merge(
      dialogClosed.pipe(
        map(_ => false),
      ),
      showSession.pipe(
        map(_ => true),
      ),
    ).pipe(
      publishBehavior(false),
    ) as ConnectableObservable<boolean>;
    subscription.add(dialogOpen.connect());

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
      shareReplay(1),
    );
    const allEvents = eventRepository.getAllEventsObservable().pipe(
      shareReplay(1),
    )

    const sessionDetail = showSession.pipe(
      switchMap(showParam => {
        return sessionRepository.getSessionObservable(showParam.sessionId).pipe(
          withLatestFrom(
            conferenceNameMap,
            allEvents,
          ),
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
                canRequest: showParam.canRequest,
              } as ISessionItem,
            } as ISessionDetail;
          }),
          startWith({state: SessionDetailState.Loading} as ISessionDetail),
          catchError((error) => of({
            state: SessionDetailState.Error,
            message: error.toString(),
          } as ISessionDetail)),
        );
      }),
      publishBehavior({
        state: SessionDetailState.NotLoaded,
      } as ISessionDetail)
    ) as ConnectableObservable<ISessionDetail>;
    subscription.add(sessionDetail.connect());

    return new DefaultSessionDetailBloc(
      subscription,
      showSession,
      dialogClosed,
      dialogOpen,
      sessionDetail,
    );
  }

  private constructor(
    private subscription: Subscription,

    // inputs
    public showSession: Observer<IShowSessionParam>,
    public dialogClosed: Observer<void>,

    // outputs
    public dialogOpen: Observable<boolean>,
    public sessionDetail: Observable<ISessionDetail>,
  ) {}

  public dispose() {
    this.subscription.unsubscribe();
  }
}

export default DefaultSessionDetailBloc;
