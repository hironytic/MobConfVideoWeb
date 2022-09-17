//
// Session.ts
//
// Copyright (c) 2018-2022 Hironori Ichimiya <hiron@hironytic.com>
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

import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue, Timestamp } from "@firebase/firestore"

export interface Session {
  id: string
  conferenceId: string
  watched: boolean
  watchedOn: WatchedOn
  title: string
  description: string
  starts: Date
  minutes: number
  slide: string | undefined
  video: string | undefined
  speakers: Speaker[]
}

export interface Speaker {
  name: string
  twitter: string | undefined
  icon: string | undefined
}

export interface WatchedOn {
  [eventId: string]: number
}

interface FSSession {
  conferenceId: string
  watched: boolean
  watchedOn: WatchedOn | undefined
  title: string
  description: string
  starts: Timestamp
  minutes: number
  slide?: string
  video?: string
  speakers: Speaker[]
}
export const sessionConverter: FirestoreDataConverter<Session> = {
  fromFirestore(snapshot: QueryDocumentSnapshot): Session {
    const data = snapshot.data() as FSSession
    return {
      id: snapshot.id,
      conferenceId: data.conferenceId,
      watched: data.watched,
      watchedOn: data.watchedOn ?? {},
      title: data.title,
      description: data.description,
      starts: data.starts.toDate(),
      minutes: data.minutes,
      slide: data.slide,
      video: data.video,
      speakers: data.speakers,
    }
  },

  toFirestore(modelObject: WithFieldValue<Session>): DocumentData {
    return {
      conferenceId: modelObject.conferenceId,
      watched: modelObject.watched,
      watchedOn: modelObject.watchedOn,
      title: modelObject.title,
      description: modelObject.description,
      starts: modelObject.starts,
      minutes: modelObject.minutes,
      slide: modelObject.slide,
      video: modelObject.video,
      speakers: modelObject.speakers,
    }
  }
}
