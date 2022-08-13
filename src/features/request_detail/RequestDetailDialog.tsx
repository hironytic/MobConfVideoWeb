//
// RequestDetailDialog.tsx
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

import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { Close, Note, OndemandVideo } from "@mui/icons-material";
import { IRDETypes } from "../../utils/IRDE";
import { Request } from "../../entities/Request";
import { RequestDetailIRDE } from "./RequestDetailLogic";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../../utils/AppBar";

export function RequestDetailDialog(): JSX.Element {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate()
  
  function onClose() {
    navigate("..");
  }
  
  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth={true}
      maxWidth="xl">
      {(fullScreen) ? (
        <>
          <AppBar>
            <Toolbar>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <Close/>
              </IconButton>
            </Toolbar>
          </AppBar>
          <DialogContent style={{ paddingTop: 76 }}>
            <RequestDetailBody/>
          </DialogContent>
        </>          
      ) : (
        <DialogContent>
          <RequestDetailBody/>
        </DialogContent>
      )}
    </Dialog>
  );
}

function RequestDetailBody(): JSX.Element {
  const request = {
      id: "r2",
      sessionId: undefined,
      title: "Request 2",
      conference: "Conference X",
      minutes: 15,
      videoUrl: "https://example.com/video2",
      slideUrl: undefined,
      memo: "memo",
      isWatched: false,
  } as Request;
  const irde = { type: IRDETypes.Done, request: request } as RequestDetailIRDE;

  switch (irde.type) {
    case IRDETypes.Initial:
      return <RequestDetailInitialBody/>;
    case IRDETypes.Running:
      return <RequestDetailRunningBody/>;
    case IRDETypes.Done:
      return <RequestDetailDoneBody request={irde.request} />
    case IRDETypes.Error:
      return <RequestDetailErrorBody message={irde.message}/>
  }
}

function RequestDetailInitialBody(): JSX.Element {
  return <></>;
}

function RequestDetailRunningBody(): JSX.Element {
  return (
    <div style={{ textAlign: "center" }}>
      <CircularProgress/>
    </div>
  );
}

interface RequestDetailDoneBodyProps {
  request: Request
}
function RequestDetailDoneBody({ request }: RequestDetailDoneBodyProps): JSX.Element {
  return (
    <Grid container={true} direction="column" spacing={2} justifyContent="space-between">
      <Grid item={true} xs={12}>
        <Grid container={true} direction="row" spacing={2} justifyContent="space-between">
          <Grid item={true}>
            <Typography variant="body2" color="textSecondary">
              {request.conference}
            </Typography>
          </Grid>
          <Grid item={true} style={{textAlign: "end"}}>
            {(request.minutes) && (
              <Typography variant="body2" color="textSecondary">
                {request.minutes}分
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item={true} xs={12}>
        <Typography variant="h5" color="textPrimary">
          {request.title}
        </Typography>
      </Grid>
      <Grid item={true} xs={12}>
        <Grid container={true} spacing={0} alignItems="center" justifyContent="flex-end">
          <Grid item={true}>
            {request.slideUrl !== undefined && (
              <Button href={request.slideUrl} target="_blank" color="primary">
                <Note /> スライド
              </Button>
            )}
          </Grid>
          <Grid item={true}>
            <Button href={request.videoUrl} target="_blank" color="primary">
              <OndemandVideo/> ビデオ
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

interface RequestDetailErrorBodyProps {
  message: string;
}
function RequestDetailErrorBody({ message }: RequestDetailErrorBodyProps): JSX.Element {
  return (
    <div style={{ textAlign: "center" }}>
      <Typography variant="body2" color="error">
        エラーが発生しました
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {message}
      </Typography>
    </div>
  );
}
