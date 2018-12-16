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

import { ConnectableObservable, never, Observable, Observer, Subject, Subscription } from "rxjs";
import { publishBehavior, startWith } from 'rxjs/operators';
import Event from "src/model/Event";
import Request from 'src/model/Request';
import { IEventRepository } from 'src/repository/EventRepository';
import { IRequestBloc, IRequestList, RequestListState } from './RequestBloc';

class DefaultRequestBloc implements IRequestBloc {
  public static create(
    eventRepository: IEventRepository,
  ): DefaultRequestBloc {
    const subscription = new Subscription();

    const currentEventIndexChanged = new Subject();    

    const allEvents = eventRepository.getAllEventsObservable().pipe(
      publishBehavior([] as Event[]),
    ) as ConnectableObservable<Event[]>;
    subscription.add(allEvents.connect());

    const currentEventIndex = currentEventIndexChanged.pipe(
      publishBehavior(0),
    ) as ConnectableObservable<number>;
    subscription.add(currentEventIndex.connect());

    const requestList = never().pipe(
      startWith({
          state: RequestListState.Loaded,
          loaded: {
            requests: [
              new Request("r1", undefined, "タイトル1なのだがこれは", "iOSDC 2013", "http://", undefined, undefined, true),
              new Request("r2", undefined, "タイトル2なのですね", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r3", undefined, "タイトル3だ", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r4", undefined, "タイトル4のああな", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r5", undefined, "タイトル5", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r6", undefined, "タイトル6", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r7", undefined, "タイトル7", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r8", undefined, "タイトル8", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r9", undefined, "タイトル9", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r10", undefined, "タイトル10もうあきた", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r11", undefined, "タイトル11", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r12", undefined, "タイトル12", "DroidKaigi 1998", "http://", undefined, undefined, false),
              new Request("r13", undefined, "タイトル13", "DroidKaigi 1998", "http://", undefined, undefined, false),
            ]    
          }
      }),      
      publishBehavior({
        state: RequestListState.Loading,
      }),
    ) as ConnectableObservable<IRequestList>;
    subscription.add(requestList.connect());

    return new DefaultRequestBloc(
      subscription,
      currentEventIndexChanged,
      allEvents,
      currentEventIndex,
      requestList,
    );
  }

  private constructor(
    private subscription: Subscription,

    // inputs
    public currentEventIndexChanged: Observer<number>,

    // outputs
    public allEvents: Observable<Event[]>,
    public currentEventIndex: Observable<number>,
    public requestList: Observable<IRequestList>,
  ) {}

  public dispose() {
    this.subscription.unsubscribe();
  }
}

export default DefaultRequestBloc;
