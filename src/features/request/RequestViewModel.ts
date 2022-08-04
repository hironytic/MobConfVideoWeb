//
// RequestViewModel.ts
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
import { Event } from "../../entities/Event";
import { Request } from "../../entities/Request";
import { BehaviorSubject, NEVER, Observable, Subscription } from "rxjs";
import { ViewModel } from "../../utils/ViewModelProvider";
import { RequestRepository } from "./RequestRepository";

export interface RequestListIProps {}
export interface RequestListRProps {}
export interface RequestListDProps { requests: Request[] }
export interface RequestListEProps { message: string }
export type RequestListIRDE = IRDE<RequestListIProps, RequestListRProps, RequestListDProps, RequestListEProps>;

export interface RequestViewModel extends ViewModel {
  readonly currentEventId: string | undefined;
  setCurrentEventId(eventId: string | undefined): void;
  
  allEvents$: Observable<Event[]>;
  requestList$: Observable<RequestListIRDE>;
}

export class NullRequestViewModel implements RequestViewModel {
  dispose() {}

  readonly currentEventId: string | undefined = undefined;
  setCurrentEventId(eventId: string | undefined): void {}
  
  allEvents$ = NEVER;
  requestList$ = NEVER;
}

export class AppRequestViewModel implements RequestViewModel {
  private readonly subscription = new Subscription();
  private requestsSubscription: Subscription | undefined = undefined;
  private currentEventId_: string | undefined = undefined;
  get currentEventId() { return this.currentEventId_; }

  allEvents$ = new BehaviorSubject<Event[]>([]);
  requestList$ = new BehaviorSubject<RequestListIRDE>({ type: IRDETypes.Initial });
  
  constructor(private readonly repository: RequestRepository) {
    this.subscription.add(
      repository.getAllEvents$().subscribe({
        next: (value) => {
          this.allEvents$.next(value);

          // FIXME:
          // if (this.currentEventId_ === undefined && value.length > 0) {
          //   this.setCurrentEventId(value[0].id);
          // }
        },
        error: (err) => {
          console.log("Error at getAllEvents$ in AppRequestViewModel", err);
          this.allEvents$.next([]);
        },
      })
    );
  }

  dispose() {
    this.subscription.unsubscribe();
    this.requestsSubscription?.unsubscribe();
  }

  setCurrentEventId(eventId: string | undefined): void {
    if (this.currentEventId_ === eventId) {
      // nothing changed.
      return;
    }
    
    if (this.requestsSubscription !== undefined) {
      this.requestsSubscription.unsubscribe();
      this.requestsSubscription = undefined;
    }
    
    if (eventId === undefined) {
      this.requestList$.next({ type: IRDETypes.Initial });
    } else {
      this.requestList$.next({ type: IRDETypes.Running });
      
      this.requestsSubscription = this.repository.getAllRequests$(eventId).subscribe({
        next: (value) => {
          this.requestList$.next({ type: IRDETypes.Done, requests: value });
        },
        error: (err) => {
          console.log("Error at getAllRequests$ in AppRequestViewModel", err);
          this.requestList$.next({ type: IRDETypes.Error, message: err.toString() });
        }
      });
    }
    this.currentEventId_ = eventId;
  }
}
