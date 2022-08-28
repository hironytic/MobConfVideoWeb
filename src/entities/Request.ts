//
// Request.ts
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

import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from "@firebase/firestore"

export interface Request {
  id: string
  sessionId: string | undefined
  title: string
  conference: string
  minutes: number | undefined
  videoUrl: string
  slideUrl: string | undefined
  memo: string | undefined
  isWatched: boolean
}

interface FSRequest {
  sessionId: string | undefined
  title: string
  conference: string
  minutes: number | undefined
  video: string
  slide: string | undefined
  memo: string | undefined
  watched: boolean
}
export const requestConverter: FirestoreDataConverter<Request> = {
  fromFirestore(snapshot: QueryDocumentSnapshot): Request {
    const data = snapshot.data() as FSRequest
    return {
      id: snapshot.id,
      sessionId: data.sessionId,
      title: data.title,
      conference: data.conference,
      minutes: data.minutes,
      videoUrl: data.video,
      slideUrl: data.slide,
      memo: data.memo,
      isWatched: data.watched,
    }
  },

  toFirestore(modelObject: WithFieldValue<Request>): DocumentData {
    return {
      sessionId: modelObject.sessionId,
      title: modelObject.title,
      conference: modelObject.conference,
      minutes: modelObject.minutes,
      video: modelObject.videoUrl,
      slide: modelObject.slideUrl,
      memo: modelObject.memo,
      watched: modelObject.isWatched,
    }
  }
}
