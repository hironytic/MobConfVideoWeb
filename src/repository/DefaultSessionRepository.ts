//
// DefaultSessionRepository.ts
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

import firebase, { firestore } from "firebase/app";
import "firebase/firestore";
import { Observable } from 'rxjs';
import Session from 'src/model/Session';
import SessionFilter from './SessionFilter';
import { ISessionRepository } from './SessionRepository';

class DefaultSessionRepository implements ISessionRepository {
  public getSessionsObservable(filter: SessionFilter): Observable<Session[]> {
    return new Observable((subscriber) => {
      let query: firestore.Query = firebase
      .firestore()
      .collection("sessions");
      if (filter.conferenceId !== undefined) {
        query = query.where("conferenceId", "==", filter.conferenceId);
      }
      if (filter.minutes !== undefined) {
        query = query.where("minutes", "==", filter.minutes);
      }
      query = query
        .orderBy("starts", "asc")
        .limit(200);

      const canceller = query
        .onSnapshot((snapshot) => {
          const requests = snapshot.docs.map((doc) => Session.fromSnapshot(doc));
          subscriber.next(requests);
        }, (error) => {
          subscriber.error(error);
        });

      return canceller;
    });    
  }
}

export default DefaultSessionRepository;
