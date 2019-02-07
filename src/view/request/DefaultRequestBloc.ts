//
// DefaultRequestBloc.ts
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

import { concat, ConnectableObservable, never, Observable, Observer, of, Subject, Subscription } from "rxjs";
import { catchError, distinctUntilChanged, filter, map, publishBehavior, startWith, switchMap, take } from 'rxjs/operators';
import Event from "src/model/Event";
import { IEventRepository } from 'src/repository/EventRepository';
import { IRequestRepository } from 'src/repository/RequestRepository';
import { IRequestBloc, IRequestList, RequestListState } from './RequestBloc';

class DefaultRequestBloc implements IRequestBloc {
  public static create(
    eventRepository: IEventRepository,
    requestRepository: IRequestRepository,
  ): DefaultRequestBloc {
    const subscription = new Subscription();

    const currentEventIdChanged = new Subject();    

    const allEvents = eventRepository.getAllEventsObservable().pipe(
      catchError(error => never().pipe(startWith([] as Event[]))),
      publishBehavior([] as Event[]),
    ) as ConnectableObservable<Event[]>;
    subscription.add(allEvents.connect());

    // The default selection is the request which is the first one
    // in the first all-events-list
    const currentEventId = concat(
      allEvents.pipe(
        filter(events => events.length > 0),  // skip (initial) empty list
        take(1),  // first one after loaded
        map(events => events[0].id),
      ),
      currentEventIdChanged,
    ).pipe(
      distinctUntilChanged(),
      publishBehavior(false),
    ) as ConnectableObservable<string | false>;
    subscription.add(currentEventId.connect());

    const requestList = currentEventId.pipe(
      switchMap((eventId) => {
        if (eventId === false) {
          return of({ state: RequestListState.NotLoaded });
        } else {
          return requestRepository.getAllRequestsObservable(eventId).pipe(
            map((requests) => ({
              state: RequestListState.Loaded,
              requests,
            } as IRequestList)),
            startWith({
              state: RequestListState.Loading,
            } as IRequestList),
            catchError((error) => of({
              state: RequestListState.Error,
              message: error.toString(),
            } as IRequestList)),
          );
        }
      }),
      publishBehavior({ state: RequestListState.NotLoaded }),
    ) as ConnectableObservable<IRequestList>;
    subscription.add(requestList.connect());

    return new DefaultRequestBloc(
      subscription,
      currentEventIdChanged,
      allEvents,
      currentEventId,
      requestList,
    );
  }

  private constructor(
    private subscription: Subscription,

    // inputs
    public currentEventIdChanged: Observer<string | false>,

    // outputs
    public allEvents: Observable<Event[]>,
    public currentEventId: Observable<string | false>,
    public requestList: Observable<IRequestList>,
  ) {}

  public dispose() {
    this.subscription.unsubscribe();
  }
}

export default DefaultRequestBloc;
