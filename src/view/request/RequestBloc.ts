//
// RequestBloc.ts
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

import { ConnectableObservable, Observable, Observer, of, Subject, Subscription } from "rxjs";
import { publishBehavior, startWith } from 'rxjs/operators';
import Event from "src/model/Event";

interface IRequestBloc extends IBloc {
  // inputs
  currentEventIndexChanged: Observer<number>;

  // outputs
  allEvents: Observable<Event[]>;
  currentEventIndex: Observable<number>;
}

class DefaultRequestBloc implements IRequestBloc {
  public static create(): DefaultRequestBloc {
    const subscription = new Subscription();

    const currentEventIndexChanged = new Subject();    
    const allEvents = of([
      new Event("id0", "第0回", false),
      new Event("id1", "第1回", false),
    ]).pipe(
      publishBehavior([] as Event[]),
    ) as ConnectableObservable<Event[]>;
    subscription.add(allEvents.connect());

    const currentEventIndex = currentEventIndexChanged.pipe(
      startWith<number>(0),
      publishBehavior(1),
    ) as ConnectableObservable<number>;
    subscription.add(currentEventIndex.connect());

    return new DefaultRequestBloc(
      subscription,
      currentEventIndexChanged,
      allEvents,
      currentEventIndex,
    );
  }

  private constructor(
    private subscription: Subscription,

    // inputs
    public currentEventIndexChanged: Observer<number>,

    // outputs
    public allEvents: Observable<Event[]>,
    public currentEventIndex: Observable<number>,
  ) {}

  public dispose() {
    this.subscription.unsubscribe();
  }
}

export { IRequestBloc, DefaultRequestBloc };

