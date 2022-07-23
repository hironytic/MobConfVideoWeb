//
// RequestRepository.ts
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

import { Event, eventConverter } from "../../models/Event";
import { Request, requestConverter } from "../../models/Request";
import { map, Observable } from "rxjs";
import { withFirestore } from "../../Firebase";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { QuerySnapshot } from "@firebase/firestore";

export interface RequestRepository {
  getAllEvents$(): Observable<Event[]>;
  getAllRequests$(eventId: string): Observable<Request[]>;
}

export class FirestoreRequestRepository implements RequestRepository {
  getAllEvents$(): Observable<Event[]> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "events");
      const docQuery = query(collectionRef,
        where("hidden", "==", false),
        orderBy("starts", "desc"),
      ).withConverter(eventConverter);
      return new Observable<QuerySnapshot<Event>>(subscriber => {
        return onSnapshot(docQuery, subscriber);
      }).pipe(
        map(snapshot => {
          return snapshot
            .docs
            .map(it => it.data())
        }),
      );
    });
  }
  
  getAllRequests$(eventId: string): Observable<Request[]> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "events", eventId, "requests");
      const docQuery = query(collectionRef,
        orderBy("requestedAt", "asc"),
      ).withConverter(requestConverter);
      return new Observable<QuerySnapshot<Request>>(subscriber => {
        return onSnapshot(docQuery, subscriber);
      }).pipe(
        map(snapshot => {
          return snapshot
            .docs
            .map(it => it.data())
        }),
      );
    });
  }
}
