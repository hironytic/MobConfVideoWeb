//
// Conference.ts
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

import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  WithFieldValue
} from "@firebase/firestore"

export interface Conference {
  id: string
  name: string,
  starts: Date
}

interface FSConference {
  name: string
  starts: Timestamp
}
export const conferenceConverter: FirestoreDataConverter<Conference> = {
  fromFirestore(snapshot: QueryDocumentSnapshot): Conference {
    const data = snapshot.data() as FSConference
    return {
      id: snapshot.id,
      name: data.name,
      starts: data.starts.toDate(),
    }
  },
  
  toFirestore(modelObject: WithFieldValue<Conference>): DocumentData {
    return modelObject
  }
}
