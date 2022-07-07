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

import { QueryDocumentSnapshot, Timestamp } from "@firebase/firestore/lite";
import { Speaker } from "./Speaker";

interface SessionData {
  conferenceId: string;
  watched: boolean;
  watchedOn: WatchedOn | undefined;
  title: string;
  description: string;
  starts: Timestamp;
  minutes: number;
  slide?: string;
  video?: string;
  speakers: SpeakerData[];
}

interface WatchedOn {
  [eventId: string]: number
}

interface SpeakerData {
  name: string;
  twitter?: string;
  icon?: string;
}

export class Session {
  static fromSnapshot(snapshot: QueryDocumentSnapshot<SessionData>): Session {
    const data = snapshot.data();

    return new Session(
      snapshot.id,
      data.conferenceId,
      data.watched,
      data.watchedOn || {},
      data.title,
      data.description,
      data.starts.toDate(),
      data.minutes,
      data.slide,
      data.video,
      data.speakers.map((speaker) => new Speaker(speaker.name, speaker.twitter, speaker.icon))
    );
  }
  
  public constructor(
    public id: string,
    public conferenceId: string,
    public watched: boolean,
    public watchedOn: WatchedOn,
    public title: string,
    public description: string,
    public starts: Date,
    public minutes: number,
    public slide: string | undefined,
    public video: string | undefined,
    public speakers: Speaker[],
  ) { }
}
