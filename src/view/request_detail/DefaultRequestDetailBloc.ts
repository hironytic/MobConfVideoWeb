//
// DefaultRequestDetailBloc.ts
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
import { catchError, map, publishBehavior, startWith, switchMap } from 'rxjs/operators';
import { IRequestRepository } from '../../repository/RequestRepository';
import { IRequestDetail, IRequestDetailBloc, IRequestRef, RequestDetailState } from './RequestDetailBloc';

class DefaultRequestDetailBloc implements IRequestDetailBloc {
  public static create(
    requestRepository: IRequestRepository,
  ) {
    const subscription = new Subscription();

    const showRequest = new Subject<IRequestRef>();
    const dialogClosed = new Subject<void>();

    const dialogOpen = merge(
      dialogClosed.pipe(
        map(_ => false),
      ),
      showRequest.pipe(
        map(_ => true),
      ),
    ).pipe(
      publishBehavior(false),
    ) as ConnectableObservable<boolean>;
    subscription.add(dialogOpen.connect());

    const requestDetail = showRequest.pipe(
      switchMap(({eventId, requestId}) => {
        return requestRepository.getRequestObservable(eventId, requestId).pipe(
          map(request => {
            return {
              state: RequestDetailState.Loaded,
              request,
            } as IRequestDetail;
          }),
          startWith({state: RequestDetailState.Loading} as IRequestDetail),
          catchError((error) => of({
            state: RequestDetailState.Error,
            message: error.toString(),
          } as IRequestDetail)),
        );
      }),
      publishBehavior({
        state: RequestDetailState.NotLoaded,
      } as IRequestDetail)
    ) as ConnectableObservable<IRequestDetail>;
    subscription.add(requestDetail.connect());

    return new DefaultRequestDetailBloc(
      subscription,

      // inputs
      showRequest,
      dialogClosed,

      // outputs
      dialogOpen,
      requestDetail,
    );
  }

  private constructor(
    private subscription: Subscription,

    // inputs
    public showRequest: Observer<IRequestRef>,
    public dialogClosed: Observer<void>,

    // outputs
    public dialogOpen: Observable<boolean>,
    public requestDetail: Observable<IRequestDetail>,
  ) {}

  public dispose() {
    this.subscription.unsubscribe();
  }
}

export default DefaultRequestDetailBloc;
