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

import { Observable } from "rxjs"
import { Request } from "../../entities/Request"
import { Session } from "../../entities/Session"
import { Event } from "../../entities/Event"
import { Firestore } from "../../Firestore"

export interface RequestDetailRepository {
  getRequest$(eventId: string, requestId: string): Observable<Request>
  getSession$(sessionId: string): Observable<Session>
  getAllEvents$(): Observable<Event[]>
  getConferenceName$(conferenceId: string): Observable<string>
}

export class FirestoreRequestDetailRepository implements RequestDetailRepository {
  getRequest$(eventId: string, requestId: string): Observable<Request> {
    return Firestore.getRequest$(eventId, requestId)
  }
  
  getSession$(sessionId: string): Observable<Session> {
    return Firestore.getSession$(sessionId)
  }
  
  getAllEvents$(): Observable<Event[]> {
    return Firestore.getAllEvents$()
  }
  
  getConferenceName$(conferenceId: string): Observable<string> {
    return Firestore.getConferenceName$(conferenceId)
  }
}
