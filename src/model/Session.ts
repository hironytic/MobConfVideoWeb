//
// Session.ts
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
import Speaker from './Speaker';

interface ISessionData {
  conferenceId: string;
  title: string;
  description: string;
  starts: firebase.firestore.Timestamp;
  minutes: number;
  slide?: string;
  video?: string;
  speakers: ISpeakerData[];
}

interface ISpeakerData {
  name: string;
  twitter?: string;
  icon?: string;
}

class Session {
  public static fromSnapshot(snapshot: firebase.firestore.DocumentSnapshot): Session {
    const data = snapshot.data() as ISessionData;
    return new Session(
      snapshot.id,
      data.conferenceId,
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
    public title: string,
    public description: string,
    public starts: Date,
    public minutes: number,
    public slide: string | undefined,
    public video: string | undefined,
    public speakers: Speaker[],
  ) { }
}

export default Session;
