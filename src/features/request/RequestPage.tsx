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

import { EventTabs } from "./EventTabs";
import { RequestList } from "./RequestList";
import { useContext, useEffect } from "react";
import { RequestContext } from "./RequestContext";
import { useNavigate, useParams } from "react-router-dom";
import { IRDETypes } from "../../utils/IRDE";
import { useObservableState } from "observable-hooks";

export function RequestPage(): JSX.Element {
  const requestLogic = useContext(RequestContext);
  const navigate = useNavigate();
  const params = useParams();
  const eventId = params["eventId"];
  const allEvents = useObservableState(requestLogic.allEvents$, []);
  const requestListIRDE = useObservableState(requestLogic.requestList$, { type: IRDETypes.Initial });

  useEffect(() => {
    if (requestLogic.currentEventId !== undefined && eventId === undefined) {
      navigate("/request/" + requestLogic.currentEventId, { replace: true });
    } else {
      requestLogic.setCurrentEventId(eventId);
    }
  }, [requestLogic, eventId, navigate]);

  const onCurrentIdChanged = (currentId: string | false) => {
    navigate("/request/" + ((currentId !== false) ? currentId : ""));
  };

  return (
    <>
      <EventTabs events={allEvents} currentId={eventId ?? false} onCurrentIdChanged={onCurrentIdChanged} />
      <RequestList requestList={requestListIRDE}/>
    </>
  );
}
