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

import firebase from "firebase/app";
import "firebase/firestore";
import { Observable } from 'rxjs';
import CaseInsensitiveSearch from '../common/CaseInsensitiveSearch';
import Session from '../model/Session';
import SessionFilter from './SessionFilter';
import { ISessionRepository } from './SessionRepository';

function filterByKeywords(keywords?: string[]): (session: Session) => boolean {
  if (keywords === undefined) {
    return session => true;
  }

  return session => {
    for (const keyword of keywords) {
      const searcher = new CaseInsensitiveSearch(keyword);
      
      if (!searcher.foundIn(session.title)) {
        if (!searcher.foundIn(session.description)) {
          let found = false;
          for (const speaker of session.speakers) {
            if (searcher.foundIn(speaker.name)) {
              found = true;
              break;
            }
            if (speaker.twitter !== undefined) {
              if (searcher.foundIn(speaker.twitter)) {
                found = true;
                break;
              }
            }
          }
          if (!found) {
            return false;
          }
        }
      }
    }

    return true;
  };
}


class DefaultSessionRepository implements ISessionRepository {
  public getSessionsObservable(filter: SessionFilter): Observable<Session[]> {
    return new Observable(subscriber => {
      let query: firebase.firestore.Query = firebase
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
        .limit(100);

      let isUnsubscribed = false;
      (async () => {
        try {
          let snapshot = await query.get();
          if (isUnsubscribed) { return; }

          if (snapshot.size <= 0) {
            subscriber.next([]);
          } else {
            let sessions: Session[] = [];
            do {
              sessions = sessions.concat(
                snapshot.docs
                  .map(doc => Session.fromSnapshot(doc))
                  .filter(filterByKeywords(filter.keywords))
              );
              if (sessions.length > 0) {
                subscriber.next(sessions);
              }
              await new Promise(resolve => setTimeout(resolve, 100));
              if (isUnsubscribed) { return; }
    
              snapshot = await query
                .startAfter(snapshot.docs[snapshot.docs.length - 1])
                .get();
              if (isUnsubscribed) { return; }
            } while (snapshot.size > 0);
            if (sessions.length === 0) {
              subscriber.next([]);
            }
          }
        } catch (error) {
          subscriber.error(error);
        }
      })();
      return () => {
        isUnsubscribed = true;
      };
    });
  }

  public getSessionObservable(sessionId: string): Observable<Session> {
    return new Observable(subscriber => {
      const canceller = firebase
        .firestore()
        .collection("sessions")
        .doc(sessionId)
        .onSnapshot(snapshot => {
          if (snapshot.exists) {
            subscriber.next(Session.fromSnapshot(snapshot));
          } else {
            subscriber.error("データが見つからないか、削除されました。")
          }
        }, error => {
          subscriber.error(error);
        });
      
      return canceller;
    });
  }
}

export default DefaultSessionRepository;
