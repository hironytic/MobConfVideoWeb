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

import { BehaviorSubject, combineLatest, ConnectableObservable, merge, never, Observable, Observer, Subject, Subscription } from "rxjs";
import { catchError, distinctUntilChanged, map, publishBehavior, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import DropdownState from '../../common/DropdownState';
import DropdownStateItem from '../../common/DropdownStateItem';
import Conference from '../../model/Conference';
import Event from '../../model/Event';
import Session from '../../model/Session';
import { IConferenceRepository } from '../../repository/ConferenceRepository';
import { IEventRepository } from '../../repository/EventRepository';
import SessionFilter from '../../repository/SessionFilter';
import { ISessionRepository } from '../../repository/SessionRepository';
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
    const filterKeywords = new BehaviorSubject<string>("");
    const executeFilter = new Subject<void>();

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
          items: [new DropdownStateItem({value: "-", title: "指定なし"}), ...dropdownItems],
        });
      }),
      catchError(() => never().pipe(
        startWith(new DropdownState({
          value: "_error_",
          items: [{
            value: "_error_",
            title: "<<エラー>>"
          }]
        })),
      )),
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
      new DropdownStateItem({value: "40", title: "40分"}),
      new DropdownStateItem({value: "45", title: "45分"}),
      new DropdownStateItem({value: "50", title: "50分"}),
      new DropdownStateItem({value: "60", title: "60分"}),
      new DropdownStateItem({value: "70", title: "70分"}),
      new DropdownStateItem({value: "120", title: "120分"}),
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
      catchError((_) => never().pipe(
        startWith(new DropdownState({
          value: "_error_",
          items: [{
            value: "_error_",
            title: "<<エラー>>"
          }]
        })),
      )),
      publishBehavior(new DropdownState({
        value: "",
        items: []
      }))
    ) as ConnectableObservable<DropdownState>;
    subscription.add(filterSessionTime.connect());

    const currentFilters = combineLatest(
      currentConferenceFilter,
      currentSessionTimeFilter,
      filterKeywords,
    );

    const sessionFilter = executeFilter.pipe(
      withLatestFrom(currentFilters, (e, v) => v),
      map(([conf, min, keywords]) => new SessionFilter({
        conferenceId: (conf === '-') ? undefined : conf,
        minutes: (min === '-') ? undefined : parseInt(min, 10),
        keywords: (keywords.trim() === "") ? undefined : keywords.trim().split(/\s+/),
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
          sessions: sessions.map<ISessionItem>(convertSession(conferenceNameMap, events)),
          keywordList: (filter.keywords !== undefined) ? filter.keywords : [],
        } as ISessionList)),
        startWith({
          state: SessionListState.Loading,          
        } as ISessionList)
      );
    }

    const sessionListState = sessionFilter.pipe(
      switchMap(loadSessions),
      catchError((error) => never().pipe(
        startWith({
          state: SessionListState.Error,
          message: error.toString(),
        } as ISessionList),
      )),
      publishBehavior({
        state: SessionListState.NotLoaded,
      } as ISessionList),
    ) as ConnectableObservable<ISessionList>;
    subscription.add(sessionListState.connect());

    return new DefaultVideoBloc(
      subscription,
      expandFilterPanel,
      filterConferenceChanged,
      filterSessionTimeChanged,
      filterKeywords,
      executeFilter,
      isFilterPanelExpanded,
      filterConference,
      filterSessionTime,
      filterKeywords,
      sessionListState,
    )
  }

  private constructor(
    private subscription: Subscription,

    // inputs
    public expandFilterPanel: Observer<boolean>,
    public filterConferenceChanged: Observer<string>,
    public filterSessionTimeChanged: Observer<string>,
    public filterKeywordsChanged: Observer<string>,

    public executeFilter: Observer<void>,

    // outputs
    public isFilterPanelExpanded: Observable<boolean>,
    public filterConference: Observable<DropdownState>,
    public filterSessionTime: Observable<DropdownState>,
    public filterKeywords: Observable<string>,
    public sessionList: Observable<ISessionList>,
  ) {}

  public dispose() {
    this.subscription.unsubscribe();
  }
}

export default DefaultVideoBloc;
