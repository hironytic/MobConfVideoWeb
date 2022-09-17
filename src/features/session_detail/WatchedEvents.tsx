//
// WatchedEvents.tsx
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

import { Grid, styled, Typography } from "@mui/material"
import { Check } from "@mui/icons-material"

const WatchedTypography = styled(Typography)(({ theme }) => ({
  borderStyle: "solid",
  borderWidth: 1,
  borderRadius: theme.shape.borderRadius,
  padding: theme.shape.borderRadius,
  borderColor: theme.palette.text.secondary,
}))

const WatchedCheck = styled(Check)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  verticalAlign: "middle",
}))

export interface IdAndName {
  id: string
  name: string
}

interface WatchedEventsProps {
  events: IdAndName[]
}
export function WatchedEvents({ events }: WatchedEventsProps): JSX.Element {
  return (
    <Grid container={true} spacing={2} justifyContent="flex-start">
      {events.map(event => (
        <Grid key={event.id} item={true}>
          <WatchedTypography variant="body2" color="textSecondary">
            <WatchedCheck/>{event.name}
          </WatchedTypography>
        </Grid>
      ))}
    </Grid>
  )
}
