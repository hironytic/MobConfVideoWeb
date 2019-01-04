//
// DefaultVideoBloc.ts
//
// Copyright (c) 2018 Hironori Ichimiya <hiron@hironytic.com>
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

import { combineLatest, ConnectableObservable, merge, Observable, Observer, of, Subject, Subscription } from "rxjs";
import { catchError, distinctUntilChanged, map, publishBehavior, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import DropdownState from 'src/common/DropdownState';
import DropdownStateItem from 'src/common/DropdownStateItem';
import Conference from 'src/model/Conference';
import Event from 'src/model/Event';
import Session from 'src/model/Session';
import { IConferenceRepository } from 'src/repository/ConferenceRepository';
import { IEventRepository } from 'src/repository/EventRepository';
import SessionFilter from 'src/repository/SessionFilter';
import { ISessionRepository } from 'src/repository/SessionRepository';
import DefaultSessionDetailBloc from '../session_detail/DefaultSessionDetailBloc';
import { ISessionDetailBloc } from '../session_detail/SessionDetailBloc';
import { IIdAndName, ISessionItem, ISessionList, IVideoBloc, SessionListState } from './VideoBloc';

class DefaultVideoBloc implements IVideoBloc {
  public static create(
    conferenceRepository: IConferenceRepository,
    sessionRepository: ISessionRepository,
    eventRepository: IEventRepository,
  ): DefaultVideoBloc {
    const subscription = new Subscription();

    const expandFilterPanel = new Subject<boolean>();
    const filterConferenceChanged = new Subject<string>();
    const filterSessionTimeChanged = new Subject<string>();
    const executeFilter = new Subject<void>();
    const sessionTapped = new Subject<ISessionItem>();
    const sessionDetailClosed = new Subject<void>();

    const isFilterPanelExpanded = merge(
      expandFilterPanel,
      executeFilter.pipe(   // also closes on executing the filter
        map(() => false),
      ),
    ).pipe(
      publishBehavior(true),
    ) as ConnectableObservable<boolean>;
    subscription.add(isFilterPanelExpanded.connect());

    const allConferences = conferenceRepository.getAllConferencesObservable().pipe(
      shareReplay(1),
    );

    const allEvents = eventRepository.getAllEventsObservable().pipe(
      shareReplay(1),
    );

    const currentConferenceFilter = filterConferenceChanged.pipe(
      startWith("-"),
      distinctUntilChanged(),
      shareReplay(1),
    );

    const filterConference = combineLatest(
      currentConferenceFilter,
      allConferences
    ).pipe(
      map(([value, items]: [string, Conference[]]) => {
        const dropdownItems = items.map((conf) => new DropdownStateItem({
          value: conf.id,
          title: conf.name,
        }));
        return new DropdownState({
          value,
          items: [{value: "-", title: "指定なし"}, ...dropdownItems],
        });
      }),
      catchError(() => of(new DropdownState({
        value: "_error_",
        items: [{
          value: "_error_",
          title: "<<エラー>>"
        }]
      }))),
      publishBehavior(new DropdownState({
        value: "",
        items: []
      }))
    ) as ConnectableObservable<DropdownState>;
    subscription.add(filterConference.connect());

    const sessionTimeItems = [
      new DropdownStateItem({value: "-", title: "指定なし"}),
      new DropdownStateItem({value: "5", title: "5分"}),
      new DropdownStateItem({value: "10", title: "10分"}),
      new DropdownStateItem({value: "15", title: "15分"}),
      new DropdownStateItem({value: "20", title: "20分"}),
      new DropdownStateItem({value: "30", title: "30分"}),
      new DropdownStateItem({value: "45", title: "45分"}),
      new DropdownStateItem({value: "50", title: "50分"}),
      new DropdownStateItem({value: "70", title: "70分"}),
    ];

    const currentSessionTimeFilter = filterSessionTimeChanged.pipe(
      startWith("-"),
      distinctUntilChanged(),
      shareReplay(1),
    );

    const filterSessionTime = currentSessionTimeFilter.pipe(
      map((value) => new DropdownState({
        value,
        items: sessionTimeItems,
      })),
      catchError((_) => of(new DropdownState({
        value: "_error_",
        items: [{
          value: "_error_",
          title: "<<エラー>>"
        }]
      }))),
      publishBehavior(new DropdownState({
        value: "",
        items: []
      }))
    ) as ConnectableObservable<DropdownState>;
    subscription.add(filterSessionTime.connect());

    const currentFilters = combineLatest(
      currentConferenceFilter,
      currentSessionTimeFilter,
    );

    const sessionFilter = executeFilter.pipe(
      withLatestFrom(currentFilters, (e, v) => v),
      map(([conf, min]) => new SessionFilter({
        conferenceId: (conf === '-') ? undefined : conf,
        minutes: (min === '-') ? undefined : parseInt(min, 10),
      })),
    );

    interface IConferenceNameMap {
      [key: string]: string
    };

    function convertSession(conferenceNameMap: IConferenceNameMap, events: Event[]) {
      return (session: Session) => {        
        const watchedEvents = events
          .filter(event => session.watchedOn[event.id] !== undefined)
          .map(event => ({id: event.id, name: event.name} as IIdAndName));
        return {
          session,
          conferenceName: conferenceNameMap[session.conferenceId],
          watchedEvents,
        } as ISessionItem;
      }
    }
    
    function makeConferenceNameMap(conferences: Conference[]) {
      return conferences.reduce((confNameMap, conference) => {
        confNameMap[conference.id] = conference.name;
        return confNameMap;
      }, {} as IConferenceNameMap)
    }

    interface ISessionsAndEventsAndConferenceNameMap {
      sessions: Session[],
      events: Event[],
      conferenceNameMap: IConferenceNameMap,
    }

    function loadSessions(filter: SessionFilter) {
      return combineLatest(
        sessionRepository.getSessionsObservable(filter),
        allConferences,
        allEvents,
        (sessions, conferences, events) => ({
          sessions,
          events,
          conferenceNameMap: makeConferenceNameMap(conferences),
        } as ISessionsAndEventsAndConferenceNameMap),
      ).pipe(
        map(({sessions, events, conferenceNameMap}) => ({
          state: SessionListState.Loaded,
          loaded: {
            sessions: sessions.map<ISessionItem>(convertSession(conferenceNameMap, events))
          }
        } as ISessionList)),
        startWith({
          state: SessionListState.Loading,          
        } as ISessionList)
      );
    }

    const sessionListState = sessionFilter.pipe(
      switchMap(loadSessions),
      catchError((error) => of({
        state: SessionListState.Error,
        error: {
          message: error.toString(),
        }
      } as ISessionList)),
      publishBehavior({
        state: SessionListState.NotLoaded,
      } as ISessionList),
    ) as ConnectableObservable<ISessionList>;
    subscription.add(sessionListState.connect());

    const sessionDetail = merge(sessionTapped, sessionDetailClosed.pipe(map(_ => undefined))).pipe(
      map(v => {
        if (v === undefined) {
          return undefined;
        } else {
          return DefaultSessionDetailBloc.createWithLoadedSession(
            v,
            sessionDetailClosed
          );
        }
      })
    );

    return new DefaultVideoBloc(
      subscription,
      expandFilterPanel,
      filterConferenceChanged,
      filterSessionTimeChanged,
      executeFilter,
      sessionTapped,
      isFilterPanelExpanded,
      filterConference,
      filterSessionTime,
      sessionListState,
      sessionDetail,
    )
  }

  private constructor(
    private subscription: Subscription,

    // inputs
    public expandFilterPanel: Observer<boolean>,
    public filterConferenceChanged: Observer<string>,
    public filterSessionTimeChanged: Observer<string>,
    public executeFilter: Observer<void>,
    public sessionTapped: Observer<ISessionItem>,

    // outputs
    public isFilterPanelExpanded: Observable<boolean>,
    public filterConference: Observable<DropdownState>,
    public filterSessionTime: Observable<DropdownState>,
    public sessionList: Observable<ISessionList>,
    public sessionDetail: Observable<ISessionDetailBloc | undefined>,
  ) {}

  public dispose() {
    this.subscription.unsubscribe();
  }
}

export default DefaultVideoBloc;
