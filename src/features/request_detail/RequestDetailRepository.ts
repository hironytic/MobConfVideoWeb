//
// RequestDetailRepository.ts
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

import { map, Observable } from "rxjs";
import { Request, requestConverter } from "../../entities/Request";
import { Session, sessionConverter } from "../../entities/Session";
import { Event, eventConverter } from "../../entities/Event";
import { withFirestore } from "../../Firebase";
import { collection, doc, DocumentSnapshot, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { QuerySnapshot } from "@firebase/firestore";
import { Conference, conferenceConverter } from "../../entities/Conference";

export interface RequestDetailRepository {
  getRequest$(eventId: string, requestId: string): Observable<Request>;
  getSession$(sessionId: string): Observable<Session>;
  getAllEvents$(): Observable<Event[]>;
  getConferenceName$(conferenceId: string): Observable<string>;
}

export class FirestoreRequestDetailRepository implements RequestDetailRepository {
  getRequest$(eventId: string, requestId: string): Observable<Request> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "events", eventId, "requests");
      const docRef = doc(collectionRef, requestId).withConverter(requestConverter);
      return new Observable<DocumentSnapshot<Request>>(subscriber => {
        return onSnapshot(docRef, subscriber);
      }).pipe(
        map(snapshot => {
          const request = snapshot.data();
          if (request === undefined) {
            throw new Error(`Request is not found.`);
          }
          return request;
        }),
      );
    });    
  }
  
  getSession$(sessionId: string): Observable<Session> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "sessions");
      const docRef = doc(collectionRef, sessionId).withConverter(sessionConverter);
      return new Observable<DocumentSnapshot<Session>>(subscriber => {
        return onSnapshot(docRef, subscriber);
      }).pipe(
        map(snapshot => {
          const session = snapshot.data();
          if (session === undefined) {
            throw new Error(`Session is not found.`);
          }
          return session;
        }),
      );
    });
  }
  
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
  
  getConferenceName$(conferenceId: string): Observable<string> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "conferences");
      const docRef = doc(collectionRef, conferenceId).withConverter(conferenceConverter);
      return new Observable<DocumentSnapshot<Conference>>(subscriber => {
        return onSnapshot(docRef, subscriber);
      }).pipe(
        map(snapshot => {
          const conference = snapshot.data();
          if (conference === undefined) {
            throw new Error(`Conference is not found.`);
          }
          return conference.name;
        }),
      );
    });
  }
}
