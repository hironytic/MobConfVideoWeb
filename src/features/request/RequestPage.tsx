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
    new Event("test", "Test", false),
    new Event("mobconfvideo12", "第12回", false),
    new Event("mobconfvideo11", "第11回", false),
    new Event("mobconfvideo10", "第10回", false),
    new Event("mobconfvideo9", "第9回", false),
    new Event("mobconfvideo8", "第8回", false),
    new Event("mobconfvideo7", "第7回", false),
    new Event("mobconfvideo6", "第6回", false),
    new Event("mobconfvideo5", "第5回", false),
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
