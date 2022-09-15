//
// SessionDetailPage.tsx
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

import { SessionItem } from "./SessionDetailLogic"
import { IRDETypes } from "../../utils/IRDE"
import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material"
import { WatchedEvents } from "./WatchedEvents"
import { Description } from "./Description"
import { Speakers } from "./Speakers"
import { Note, OndemandVideo } from "@mui/icons-material"
import { SessionDetailProvider } from "./SessionDetailProvider"
import { useContext, useEffect } from "react"
import { SessionDetailContext } from "./SessionDetailContext"
import { useObservableState } from "observable-hooks"
import { useParams } from "react-router-dom"
import { NewRequestFromSessionDialog } from "./NewRequestFromSessionDialog"
import { RequestSubmissionContext } from "../request_submission/RequestSubmissionContext"

export function SessionDetailPage(): JSX.Element {
  return (
    <SessionDetailProvider>
      <Box sx={{ p: 4 }}>
        <SessionDetailBody/>
      </Box>
      <NewRequestFromSessionDialog/>
    </SessionDetailProvider>      
  )
}

function SessionDetailBody(): JSX.Element {
  const logic = useContext(SessionDetailContext)
  const newRequestLogic = useContext(RequestSubmissionContext)
  const params = useParams()
  const sessionId = params["sessionId"]
  const irde = useObservableState(logic.sessionDetail$, { type: IRDETypes.Initial })
  
  useEffect(() => {
    logic.setRequestSubmissionLogic(newRequestLogic)
  }, [logic, newRequestLogic])
  
  useEffect(() => {
    if (sessionId !== undefined) {
      logic.setCurrentSession(sessionId)
    }
  }, [logic, sessionId])

  switch (irde.type) {
    case IRDETypes.Initial:
      return <SessionDetailInitialBody/>
    case IRDETypes.Running:
      return <SessionDetailRunningBody/>
    case IRDETypes.Done:
      return <SessionDetailDoneBody sessionItem={irde.sessionItem} />
    case IRDETypes.Error:
      return <SessionDetailErrorBody message={irde.message}/>
  }
}

function SessionDetailInitialBody(): JSX.Element {
  return <></>
}

function SessionDetailRunningBody(): JSX.Element {
  return (
    <div style={{ textAlign: "center" }}>
      <CircularProgress/>
    </div>
  )
}

interface SessionDetailDoneBodyProps {
  sessionItem: SessionItem
}
function SessionDetailDoneBody({ sessionItem }: SessionDetailDoneBodyProps): JSX.Element {
  const logic = useContext(SessionDetailContext)
  const requestSession = () => {
    logic.requestCurrentSession()
  }
  
  return (
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
      {(sessionItem.watchedEvents.length > 0) && (
        <Grid item={true} xs={12}>
          <WatchedEvents events={sessionItem.watchedEvents}/>
        </Grid>
      )}
      <Grid item={true} xs={12}>
        <Typography variant="h5" color="textPrimary">
          {sessionItem.session.title}
        </Typography>
      </Grid>
      <Grid item={true} xs={12}>
        <Description description={sessionItem.session.description}/>
      </Grid>
      <Grid item={true} xs={12}>
        <Grid container={true} spacing={0} alignItems="flex-end" justifyContent="space-between">
          <Grid item={true}>
            <Speakers speakers={sessionItem.session.speakers}/>
          </Grid>
          <Grid item={true} style={{flexGrow: 1}}>
            <Grid container={true} spacing={0} alignItems="center" justifyContent="flex-end">
              <Grid item={true}>
                {sessionItem.session.slide !== undefined && (
                  <Button href={sessionItem.session.slide} target="_blank" color="primary">
                    <Note /> スライド
                  </Button>
                )}
              </Grid>
              <Grid item={true}>
                {sessionItem.session.video !== undefined && (
                  <Button href={sessionItem.session.video} target="_blank" color="primary">
                    <OndemandVideo/> ビデオ
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item={true} xs={12}>
        <Grid container={true} spacing={0} justifyContent="center">
          <Grid item={true}>
            <Button variant="contained" color="primary" onClick={requestSession}>この動画をリクエスト</Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

interface SessionDetailErrorBodyProps {
  message: string
}
function SessionDetailErrorBody({ message }: SessionDetailErrorBodyProps): JSX.Element {
  return (
    <div style={{ textAlign: "center" }}>
      <Typography variant="body2" color="error">
        エラーが発生しました
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {message}
      </Typography>
    </div>
  )
}
