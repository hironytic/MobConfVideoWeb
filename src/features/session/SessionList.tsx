//
// SessionList.tsx
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

import { IRDETypes } from "../../utils/IRDE";
import { SessionItem } from "./SessionLogic";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { SessionCard } from "./SessionCard";
import { SessionContext } from "./SessionContext";
import { useContext } from "react";
import { useObservableState } from "observable-hooks";

export function SessionList(): JSX.Element {
  const sessionLogic = useContext(SessionContext);
  const sessionList = useObservableState(sessionLogic.sessionList$, { type: IRDETypes.Initial });

  switch (sessionList.type) {
    case IRDETypes.Initial:
      return <SessionListInitialBody/>;
    case IRDETypes.Running:
      return <SessionListRunningBody/>;
    case IRDETypes.Done:
      return <SessionListDoneBody sessions={sessionList.sessions} keywordList={sessionList.keywordList}/>
    case IRDETypes.Error:
      return <SessionListErrorBody message={sessionList.message}/>
  }
}

function SessionListInitialBody(): JSX.Element {
  return <></>;
}

function SessionListRunningBody(): JSX.Element {
  return (
    <Box sx={{ mt: 8, textAlign: "center" }}>
      <CircularProgress />
    </Box>
  );
}

interface SessionListDoneBodyProps {
  sessions: SessionItem[];
  keywordList: string[];
}
function SessionListDoneBody({ sessions, keywordList }: SessionListDoneBodyProps): JSX.Element {
  if (sessions.length === 0) {
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="body2" color="textSecondary">
          動画セッションが見つかりません
        </Typography>
      </Box>
    );
  }

  // sort keywords in order from longest to shortest
  const sortedKeywordList = [...keywordList].sort((left, right) => right.length - left.length);
  return (
    <Grid container={true} spacing={3} alignItems="flex-start">
      {sessions.map(sessionItem => (
        <Grid key={sessionItem.session.id} item={true} xs={12}>
          <SessionCard sessionItem={sessionItem}
                       keywordList={sortedKeywordList}
                       onClick={() => {}}/>
        </Grid>
      ))}
    </Grid>
  );
}

interface SessionListErrorBodyProps {
  message: string;
}
function SessionListErrorBody({ message }: SessionListErrorBodyProps): JSX.Element {
  return (
    <Box sx={{ mt: 8, textAlign: "center" }}>
      <Typography variant="body2" color="error">
        動作が正しく検索できませんでした
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {message}
      </Typography>
    </Box>
  );
}
