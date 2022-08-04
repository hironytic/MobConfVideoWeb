//
// EventTabs.tsx
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

import { Event } from "../../entities/Event";
import { Box, CircularProgress, Tab, Tabs } from "@mui/material";

interface EventTabsProps {
  events: Event[];
  currentId: string | false;
  onCurrentIdChanged: (currentId: string | false) => void;
}

export function EventTabs({ events, currentId, onCurrentIdChanged }: EventTabsProps): JSX.Element {
  if (events.length === 0) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress size={18} sx={{ m: 2 }} />
      </Box>
    );
  } else {
    return (
      <Tabs value={currentId}
            onChange={(_, value) => onCurrentIdChanged(value)}
            variant="scrollable">
        {events.map(event => (
          <Tab key={event.id} label={event.name} value={event.id}/>
        ))}
      </Tabs>
    );
  }
}
