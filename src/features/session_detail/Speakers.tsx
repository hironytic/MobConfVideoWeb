//
// Speakers.tsx
//
// Copyright (c) 2019-2022 Hironori Ichimiya <hiron@hironytic.com>
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

import { Speaker } from "../../entities/Session";
import { Avatar, Grid, Typography } from "@mui/material";

interface SpeakersProps {
  speakers: Speaker[];
}
export function Speakers({ speakers }: SpeakersProps): JSX.Element {
  return (
    <>
      {speakers.map((speaker, index) => <OneSpeaker key={index} speaker={speaker}/>)}
    </>
  );
}

interface OneSpeakerProps {
  speaker: Speaker;
}
function OneSpeaker({ speaker }: OneSpeakerProps): JSX.Element {
  return (
    <Grid container={true} spacing={1} alignItems="center" justifyItems="flex-start">
      <Grid item={true}>
        <Avatar src={speaker.icon}/>
      </Grid>
      <Grid item={true}>
        <Typography variant="body2" color="textPrimary">
          {speaker.name}
        </Typography>
      </Grid>
    </Grid>
  );
}
