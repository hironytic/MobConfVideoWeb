//
// RequestList.tsx
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
import { Request } from "../../entities/Request";
import { RequestListIRDE } from "./RequestLogic";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { RequestCard } from "./RequestCard";

interface RequestListProps {
  requestList: RequestListIRDE;
}

export function RequestList({ requestList }: RequestListProps): JSX.Element {
  switch (requestList.type) {
    case IRDETypes.Initial:
      return <RequestListInitialBody/>;
    case IRDETypes.Running:
      return <RequestListRunningBody/>;
    case IRDETypes.Done:
      return <RequestListDoneBody requests={requestList.requests}/>
    case IRDETypes.Error:
      return <RequestListErrorBody message={requestList.message}/>
  }
}

function RequestListInitialBody(): JSX.Element {
  return <></>;
}

function RequestListRunningBody(): JSX.Element {
  return (
    <Box sx={{ mt: 8, textAlign: "center" }}>
      <CircularProgress />
    </Box>
  );
}

interface RequestListDoneBodyProps {
  requests: Request[]; 
}
function RequestListDoneBody({ requests }: RequestListDoneBodyProps): JSX.Element {
  if (requests.length === 0) {
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="body2" color="textSecondary">
          リクエストがありません
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mt: 2, p: 2 }}>
      <Grid container={true} spacing={3} alignItems="flex-start">
        {
          requests.map(request => (
            <Grid key={request.id} item={true} xs={12} md={6} lg={4}>
              <RequestCard request={request} onClick={() => {}}/>
            </Grid>
          ))
        }
      </Grid>
    </Box>
  );
}

interface RequestListErrorBodyProps {
  message: string;
}
function RequestListErrorBody({ message }: RequestListErrorBodyProps): JSX.Element {
  return (
    <Box sx={{ mt: 8, textAlign: "center" }}>
      <Typography variant="body2" color="error">
        リクエストが読み込めませんでした
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {message}
      </Typography>
    </Box>
  );
}
