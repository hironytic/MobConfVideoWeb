//
// Firestore.ts
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

import { map, Observable } from "rxjs"
import { Config, configConverter } from "./entities/Config"
import { getFirestore, withFirestore } from "./Firebase"
import {
  collection,
  doc,
  DocumentSnapshot,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where
} from "firebase/firestore"
import { Event, eventConverter } from "./entities/Event"
import { Query, QuerySnapshot } from "@firebase/firestore"
import { Request, requestConverter } from "./entities/Request"
import { Session, sessionConverter } from "./entities/Session"
import { Conference, conferenceConverter } from "./entities/Conference"
import { CaseInsensitiveSearch } from "./utils/CaseInsensitiveSearch"

export interface SessionFilter {
  conferenceId?: string,
  minutes?: number,
  keywords?: string[],
}

export interface FilteredSessions {
  sessions: Session[]
  more: (() => Promise<FilteredSessions>) | undefined
}

export class Firestore {
  static getConfig$(): Observable<Config> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "config")
      const docRef = doc(collectionRef, "config").withConverter(configConverter)
      return new Observable<DocumentSnapshot<Config>>(subscriber => {
        return onSnapshot(docRef, subscriber)
      }).pipe(
        map(snapshot => {
          const config = snapshot.data()
          if (config === undefined) {
            throw new Error("Configuration value is not found on Firestore!")
          }
          return config
        }),
      )
    })
  }

  static async getAllEvents(): Promise<Event[]> {
    const firestore = await getFirestore()
    const collectionRef = collection(firestore, "events")
    const docQuery = query(collectionRef,
      where("hidden", "==", false),
      orderBy("starts", "desc"),
    ).withConverter(eventConverter)
    const snapshot = await getDocs(docQuery)
    return snapshot.docs.map(doc => doc.data())
  }
  
  static getAllEvents$(): Observable<Event[]> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "events")
      const docQuery = query(collectionRef,
        where("hidden", "==", false),
        orderBy("starts", "desc"),
      ).withConverter(eventConverter)
      return new Observable<QuerySnapshot<Event>>(subscriber => {
        return onSnapshot(docQuery, subscriber)
      }).pipe(
        map(snapshot => {
          return snapshot
            .docs
            .map(it => it.data())
        }),
      )
    })
  }

  static getAllRequests$(eventId: string): Observable<Request[]> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "events", eventId, "requests")
      const docQuery = query(collectionRef,
        orderBy("requestedAt", "asc"),
      ).withConverter(requestConverter)
      return new Observable<QuerySnapshot<Request>>(subscriber => {
        return onSnapshot(docQuery, subscriber)
      }).pipe(
        map(snapshot => {
          return snapshot
            .docs
            .map(it => it.data())
        }),
      )
    })
  }

  static getRequest$(eventId: string, requestId: string): Observable<Request> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "events", eventId, "requests")
      const docRef = doc(collectionRef, requestId).withConverter(requestConverter)
      return new Observable<DocumentSnapshot<Request>>(subscriber => {
        return onSnapshot(docRef, subscriber)
      }).pipe(
        map(snapshot => {
          const request = snapshot.data()
          if (request === undefined) {
            throw new Error(`Request is not found.`)
          }
          return request
        }),
      )
    })
  }

  static async getSessions(filter: SessionFilter): Promise<FilteredSessions> {
    const LIMIT = 100
    const firestore = await getFirestore()
    const collectionRef = collection(firestore, "sessions")
    let docQuery: Query<Session> = collectionRef.withConverter(sessionConverter)
    if (filter.conferenceId !== undefined) {
      docQuery = query(docQuery, where("conferenceId", "==", filter.conferenceId))
    }
    if (filter.minutes !== undefined) {
      docQuery = query(docQuery, where("minutes", "==", filter.minutes))
    }
    docQuery = query(docQuery,
      orderBy("starts", "asc"),
      limit(LIMIT),
    )
    return await filterSessions(docQuery)

    async function filterSessions(docQuery: Query<Session>): Promise<FilteredSessions> {
      const snapshot = await getDocs(docQuery)
      const sessions = snapshot
        .docs
        .map(doc => doc.data())
        .filter(filterByKeywords(filter.keywords))
      let more: (() => Promise<FilteredSessions>) | undefined = undefined
      if (snapshot.size === LIMIT) {
        const nextQuery = query(docQuery, startAfter(snapshot.docs[snapshot.docs.length - 1]))
        more = async () => await filterSessions(nextQuery)
      }
      return { sessions, more }
    }

    function filterByKeywords(keywords?: string[]): (session: Session) => boolean {
      if (keywords === undefined) {
        return _ => true
      }

      return session => {
        for (const keyword of keywords) {
          const searcher = new CaseInsensitiveSearch(keyword)

          if (!searcher.foundIn(session.title)) {
            if (!searcher.foundIn(session.description)) {
              let found = false
              for (const speaker of session.speakers) {
                if (searcher.foundIn(speaker.name)) {
                  found = true
                  break
                }
                if (speaker.twitter !== undefined) {
                  if (searcher.foundIn(speaker.twitter)) {
                    found = true
                    break
                  }
                }
              }
              if (!found) {
                return false
              }
            }
          }
        }

        return true
      }
    }
  }
  
  static getSession$(sessionId: string): Observable<Session> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "sessions")
      const docRef = doc(collectionRef, sessionId).withConverter(sessionConverter)
      return new Observable<DocumentSnapshot<Session>>(subscriber => {
        return onSnapshot(docRef, subscriber)
      }).pipe(
        map(snapshot => {
          const session = snapshot.data()
          if (session === undefined) {
            throw new Error(`Session is not found.`)
          }
          return session
        }),
      )
    })
  }

  static getAllConferences$(): Observable<Conference[]> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "conferences")
      const docQuery = query(collectionRef,
        orderBy("starts", "desc"),
      ).withConverter(conferenceConverter)
      return new Observable<QuerySnapshot<Conference>>(subscriber => {
        return onSnapshot(docQuery, subscriber)
      }).pipe(
        map(snapshot => {
          return snapshot
            .docs
            .map(it => it.data())
        }),
      )
    })
  }
  
  static getConferenceName$(conferenceId: string): Observable<string> {
    return withFirestore(firestore => {
      const collectionRef = collection(firestore, "conferences")
      const docRef = doc(collectionRef, conferenceId).withConverter(conferenceConverter)
      return new Observable<DocumentSnapshot<Conference>>(subscriber => {
        return onSnapshot(docRef, subscriber)
      }).pipe(
        map(snapshot => {
          const conference = snapshot.data()
          if (conference === undefined) {
            throw new Error(`Conference is not found.`)
          }
          return conference.name
        }),
      )
    })
  }
}
