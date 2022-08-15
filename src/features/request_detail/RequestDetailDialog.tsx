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
import { RequestDetail, RequestDetailIRDE } from "./RequestDetailLogic";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../../utils/AppBar";
import { WatchedEvents } from "../session_detail/WatchedEvents";
import { Description } from "../session_detail/Description";
import { Speakers } from "../session_detail/Speakers";

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
  const requestDetail = {
    conference: "Conference X",
    minutes: 15,
    title: "Request 2",
    watchedEvents: [{ id: "e1", name: "第1回" }, { id: "e3", name: "第3回" }],
    description: "説明の文章です。\nかなり説明しています。これだけ説明すればいいでしょう。\nまだまだ説明します？\nもっとですか？\nこれでどうでしょうか。もういいですか？\nこれが最後の説明です。丁寧に説明しました。最後にまとめると、いろいろと説明しているということです。非常に多くの説明が必要でしたが、それらを完遂することができました。",
    speakers: [{ name: "hoge", twitter: undefined, icon: undefined }],
    slideUrl: undefined,
    videoUrl: "https://example.com/video2",
  } as RequestDetail;
  const irde = { type: IRDETypes.Done, requestDetail: requestDetail } as RequestDetailIRDE;

  switch (irde.type) {
    case IRDETypes.Initial:
      return <RequestDetailInitialBody/>;
    case IRDETypes.Running:
      return <RequestDetailRunningBody/>;
    case IRDETypes.Done:
      return <RequestDetailDoneBody requestDetail={irde.requestDetail} />
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
  requestDetail: RequestDetail
}
function RequestDetailDoneBody({ requestDetail }: RequestDetailDoneBodyProps): JSX.Element {
  return (
    <Grid container={true} spacing={2} justifyContent="space-between">
      <Grid item={true} xs={12}>
        <Grid container={true} spacing={2} justifyContent="space-between">
          <Grid item={true}>
            <Typography variant="body2" color="textSecondary">
              {requestDetail.conference}
            </Typography>
          </Grid>
          <Grid item={true} style={{textAlign: "end"}}>
            {(requestDetail.minutes) && (
              <Typography variant="body2" color="textSecondary">
                {requestDetail.minutes}分
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
      {(requestDetail.watchedEvents !== undefined && requestDetail.watchedEvents.length > 0) && (
        <Grid item={true} xs={12}>
          <WatchedEvents events={requestDetail.watchedEvents}/>
        </Grid>
      )}
      <Grid item={true} xs={12}>
        <Typography variant="h5" color="textPrimary">
          {requestDetail.title}
        </Typography>
      </Grid>
      {(requestDetail.description !== undefined) && (
        <Grid item={true} xs={12}>
          <Description description={requestDetail.description}/>
        </Grid>
      )}
      <Grid item={true} xs={12}>
        <Grid container={true} spacing={0} alignItems="flex-end" justifyContent="space-between">
          {(requestDetail.speakers !== undefined) && ( 
            <Grid item={true}>
              <Speakers speakers={requestDetail.speakers}/>
            </Grid>
          )}
          <Grid item={true} style={{flexGrow: 1}}>
            <Grid container={true} spacing={0} alignItems="center" justifyContent="flex-end">
              <Grid item={true}>
                {requestDetail.slideUrl !== undefined && (
                  <Button href={requestDetail.slideUrl} target="_blank" color="primary">
                    <Note /> スライド
                  </Button>
                )}
              </Grid>
              <Grid item={true}>
                {requestDetail.videoUrl !== undefined && (
                  <Button href={requestDetail.videoUrl} target="_blank" color="primary">
                    <OndemandVideo/> ビデオ
                  </Button>
                )}
              </Grid>
            </Grid>
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
