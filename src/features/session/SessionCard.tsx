//
// SessionCard.tsx
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

import { IdAndName, SessionItem } from "./SessionViewModel";
import { Avatar, Card, CardActionArea, Grid, styled, Typography } from "@mui/material";
import { Check } from "@mui/icons-material";
import { CaseInsensitiveSearch } from "../../utils/CaseInsensitiveSearch";
import { Speaker } from "../../models/Session";

export interface SessionCardProps {
  sessionItem: SessionItem;
  keywordList: string[];
  onClick: () => void;
}

export function SessionCard({ sessionItem, keywordList, onClick }: SessionCardProps): JSX.Element {
  const sessionTitleLwbr = detectBoldRange(sessionItem.session.title, keywordList);
  return (
    <Card sx={{ mx: "auto" }} elevation={3}>
      <CardActionArea sx={{ p: 2 }} onClick={() => onClick()}>
        <Grid container={true} spacing={2} justifyContent="space-between">
          <Grid item={true} xs={12}>
            <Grid container={true} spacing={2} justifyContent="space-between">
              <Grid item={true}>
                <Typography variant="body2" color="textSecondary">
                  {sessionItem.conferenceName}
                </Typography>
              </Grid>
              <Grid item={true} style={{textAlign: "end"}}>
                <Typography variant="body2" color="textSecondary">
                  {sessionItem.session.minutes}分
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <WatchedEvents events={sessionItem.watchedEvents}/>
          <Grid item={true} xs={12}>
            <Typography variant="h5" color="textPrimary">
              <BoldableLine lwbr={sessionTitleLwbr}/>
            </Typography>
          </Grid>
          <Grid item={true} xs={12}>
            <Description description={sessionItem.session.description} keywordList={keywordList}/>
          </Grid>
          <Grid item={true} xs={12}>
            {sessionItem.session.speakers.map((speaker, index) => <SpeakerArea key={index} speaker={speaker} keywordList={keywordList}/>)}
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
}

const WatchedTypography = styled(Typography)(({ theme }) => ({
  borderStyle: "solid",
  borderWidth: 1,
  borderRadius: theme.shape.borderRadius,
  padding: theme.shape.borderRadius,
  borderColor: theme.palette.text.secondary,
}));

const WatchedCheck = styled(Check)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  verticalAlign: "middle",
}));

interface WatchedEventsProps {
  events: IdAndName[];
}
function WatchedEvents({ events }: WatchedEventsProps): JSX.Element {
  return events.length === 0 ? <></> : (
    <Grid item={true} xs={12}>
      <Grid container={true} spacing={2} justifyContent="flex-start">
        {events.map(event => (
          <Grid key={event.id} item={true}>
            <WatchedTypography variant="body2" color="textSecondary">
              <WatchedCheck/>{event.name}
            </WatchedTypography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}

interface DescriptionProps {
  description: string;
  keywordList: string[];
}
function Description({ description, keywordList }: DescriptionProps): JSX.Element {
  const maxLines = 3;
  const maxChars = 140;

  const lines = description.split(/\r\n|\r|\n/);
  const lineWithBoldRanges: LineWithBoldRange[] = lines.map(line => detectBoldRange(line, keywordList))

  const displayLines: LineWithBoldRange[] = [];
  const firstKeywordLine = lineWithBoldRanges.findIndex(lwbr => lwbr.boldRanges.length > 0);
  if (firstKeywordLine === -1) {
    // the case that no keywords are found in description
    let count = 0;
    for (const line of lines) {
      if (displayLines.length >= maxLines) {
        displayLines.push({line: "…", boldRanges: []});
        break;
      }

      const length = line.length;
      if (count + length < maxChars) {
        count += length;
        displayLines.push({line, boldRanges: []});
      } else {
        displayLines.push({line: line.substring(0, maxChars - count) + "…", boldRanges: []});
        break;
      }
    }
  } else {
    // the case that keywords are found in description
    let count = 0;
    for (let lineIndex = firstKeywordLine; lineIndex < lineWithBoldRanges.length; lineIndex++) {
      if (displayLines.length >= maxLines) {
        displayLines.push({line: "…", boldRanges: []});
        break;
      }

      let lwbr = lineWithBoldRanges[lineIndex];
      if (lineIndex === firstKeywordLine) {
        if (lwbr.boldRanges[0].offset > maxChars / 2) {
          const beginOffset = lwbr.boldRanges[0].offset - Math.floor(maxChars / 2);
          const beginOffset2 = beginOffset - "…".length;
          lwbr = {
            line: "…" + lwbr.line.substring(beginOffset),
            boldRanges: lwbr.boldRanges.map(range => ({offset: range.offset - beginOffset2, length: range.length})),
          }
        } else {
          if (firstKeywordLine > 0) {
            displayLines.push({line: "…", boldRanges: []});
          }
        }
      }
      const length = lwbr.line.length;
      if (count + length < maxChars) {
        count += length;
        displayLines.push({line: lwbr.line, boldRanges: lwbr.boldRanges});
      } else {
        const currentCount = count;
        displayLines.push({line: lwbr.line.substring(0, maxChars - currentCount) + "…", boldRanges: lwbr.boldRanges.filter(range => range.offset + range.length <= maxChars - currentCount)});
        break;
      }
    }
  }

  return (
    <>
      {
        displayLines.map((lwbr, index) => (
          <Typography key={index} variant="body2" color="textPrimary">
            {lwbr.line.length > 0 ? <BoldableLine lwbr={lwbr}/> : <br/>}
          </Typography>
        ))
      }
    </>
  );
}

interface SpeakerAreaProps {
  speaker: Speaker;
  keywordList: string[];
}
function SpeakerArea({ speaker, keywordList }: SpeakerAreaProps): JSX.Element {
  const lwbr = detectBoldRange(speaker.name, keywordList);
  return (
    <Grid container={true} spacing={1} alignItems="center" justifyItems="flex-start">
      <Grid item={true}>
        <Avatar src={speaker.icon}/>
      </Grid>
      <Grid item={true}>
        <Typography variant="body2" color="textPrimary">
          <BoldableLine lwbr={lwbr}/>
        </Typography>
      </Grid>
    </Grid>
  );
}

interface BoldRange {
  offset: number,
  length: number,
}
interface LineWithBoldRange {
  line: string,
  boldRanges: BoldRange[],
}

function detectBoldRange(line: string, keywordList: string[]): LineWithBoldRange {
  let searchOffset = 0;
  let nextRange: BoldRange | null;
  const boldRanges: BoldRange[] = [];
  const searchList = keywordList.map(keyword => new CaseInsensitiveSearch(keyword));
  do {
    const currentOffset = searchOffset;

    // assume that keywordList is sorted in order from longest to shortest
    nextRange = searchList.reduce((acc, search) => {
      const searchResult = search.searchIn(line, currentOffset);
      if (searchResult !== null && (acc === null || searchResult.index < acc.offset)) {
        return {offset: searchResult.index, length: searchResult.length};
      } else {
        return acc;
      }
    }, null as (BoldRange | null));
    if (nextRange !== null) {
      boldRanges.push(nextRange);
      searchOffset = nextRange.offset + nextRange.length;
    }
  } while (nextRange !== null);
  return { line, boldRanges };
}

interface BoldableLineProps {
  lwbr: LineWithBoldRange;
}
function BoldableLine({ lwbr }: BoldableLineProps): JSX.Element {
  const elements: JSX.Element[] = [];
  let current = 0;
  let key = 0;
  for (const range of lwbr.boldRanges) {
    elements.push((<span key={key++}>{lwbr.line.substring(current, range.offset)}</span>));
    elements.push((<b key={key++}>{lwbr.line.substring(range.offset, range.offset + range.length)}</b>));
    current = range.offset + range.length;
  }
  if (current < lwbr.line.length) {
    elements.push((<span key={key++}>{lwbr.line.substring(current, lwbr.line.length)}</span>));
  }

  return (
    <>
      { elements }
    </>
  );
}
