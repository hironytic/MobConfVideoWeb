//
// RequestSubmissionDialog.tsx
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

import {
  ErrorPhase, FinishedPhase,
  Phase,
  PhaseTypes,
  RequestKeyNeededPhase,
} from "./RequestSubmissionLogic"
import {
  Box, Button,
  CircularProgress,
  Dialog, DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack, TextField,
  Typography
} from "@mui/material"
import { useObservableState } from "observable-hooks"
import { ChangeEvent, useContext } from "react"
import { RequestSubmissionContext } from "./RequestSubmissionContext"

export function RequestSubmissionDialog(): JSX.Element {
  const logic = useContext(RequestSubmissionContext)
  const phase = useObservableState(logic.phase$, { type: PhaseTypes.Nothing })
  const isDialogOpen = phase.type !== PhaseTypes.Nothing

  return (
    <Dialog
      open={isDialogOpen}
      maxWidth="xl">
        <DialogBody phase={phase}/>
    </Dialog>
  )
}

interface DialogBodyProps {
  phase: Phase
}
function DialogBody({ phase }: DialogBodyProps): JSX.Element {
  switch (phase.type) {
    case PhaseTypes.Nothing:
      return (<></>)  // Doesn't occur
    
    case PhaseTypes.Processing:
      return <ProcessingBody/>
    
    case PhaseTypes.RequestKeyNeeded:
      return <RequestKeyNeededBody phase={phase} />
    
    case PhaseTypes.Finished:
      return <FinishedBody phase={phase} />
    
    case PhaseTypes.Error:
      return <ErrorBody phase={phase} />
  }
}

function ProcessingBody(): JSX.Element {
  return (
    <DialogContent>
      <Box sx={{ p: 1, textAlign: "center" }} >
        <Stack direction="column" spacing={4} alignItems="center">
          <Typography variant="body1" component="span">リクエスト処理中</Typography>
          <CircularProgress/>
        </Stack>
      </Box>
    </DialogContent>
  )
}

interface RequestKeyNeededBodyProps {
  phase: RequestKeyNeededPhase
}
function RequestKeyNeededBody({ phase }: RequestKeyNeededBodyProps): JSX.Element {
  const requestKey = useObservableState(phase.requestKey$, "")
  const onRequestKeyChange = (event: ChangeEvent<HTMLInputElement>): void => {
    phase.requestKeyValueChanged(event.target.value)
  }
  const onDone = () => {
    phase.finish(true)
  }
  const onCancel = () => {
    phase.finish(false)
  }
  
  return (
    <>
      <DialogTitle>リクエストキーの入力</DialogTitle>
      <DialogContent>
        <DialogContentText>
          リクエストキーを入力してください。
          リクエストキーは動画鑑賞会の開催ごとに異なり、事前に、または当日の会場で、参加者に公開されます。
        </DialogContentText>
        <TextField
          type="text"
          autoFocus={true}
          label="リクエストキー"
          margin="normal"
          fullWidth={true}
          onChange={onRequestKeyChange}
          value={requestKey} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">キャンセル</Button>
        <Button onClick={onDone} color="primary">OK</Button>
      </DialogActions>
    </>
  )
}

interface FinishedBodyProps {
  phase: FinishedPhase
}
function FinishedBody({ phase }: FinishedBodyProps): JSX.Element {
  const onOK = () => {
    phase.closeDialog()
  }
  
  return (
    <>
      <DialogTitle>
        処理完了
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          リクエストを行いました。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onOK} color="primary" autoFocus={true}>OK</Button>
      </DialogActions>
    </>
  )
}

interface ErrorBodyProps {
  phase: ErrorPhase
}
function ErrorBody({ phase }: ErrorBodyProps): JSX.Element {
  const onOK = () => {
    phase.closeDialog()
  }

  return (
    <>
      <DialogTitle>
        エラー
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="error">リクエスト中にエラーが発生しました。</Typography>
        <Typography variant="body2" color="textSecondary">{phase.message}</Typography>         
      </DialogContent>
      <DialogActions>
        <Button onClick={onOK} color="primary" autoFocus={true}>OK</Button>
      </DialogActions>
    </>
  )
}
