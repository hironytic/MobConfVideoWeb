//
// RequestPage.tsx
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

import { Event } from "../../models/Event";
import { EventTabs } from "./EventTabs";
import { RequestList } from "./RequestList";

export function RequestPage(): JSX.Element {
  const events: Event[] = [
    {
      id: "test",
      name: "Test",
      isAccepting: false,
    },
    {
      id: "mobconfvideo12",
      name: "第12回",
      isAccepting: false,
    },
    {
      id: "mobconfvideo11",
      name: "第11回",
      isAccepting: false,
    },
    {
      id: "mobconfvideo10",
      name: "第10回",
      isAccepting: false,
    },
    {
      id: "mobconfvideo9",
      name: "第9回",
      isAccepting: false,
    },
    {
      id: "mobconfvideo8",
      name: "第8回",
      isAccepting: false,
    },
    {
      id: "mobconfvideo7",
      name: "第7回",
      isAccepting: false,
    },
    {
      id: "mobconfvideo6",
      name: "第6回",
      isAccepting: false,
    },
    {
      id: "mobconfvideo5",
      name: "第5回",
      isAccepting: false,
    },
  ];
  const currentId = "mobconfvideo12";
  const onCurrentIdChanged = (currentId: string | false) => {};
  
  return (
    <>
      <EventTabs events={events} currentId={currentId} onCurrentIdChanged={onCurrentIdChanged} />
      <RequestList/>
    </>
  );
}
