//
// RequestKeyDialog.tsx
//
// Copyright (c) 2019 Hironori Ichimiya <hiron@hironytic.com>
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

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
import React, { Key } from 'react';
import { executeBackNavigation, prepareBackNavigation } from 'src/common/BackNavigation';
import Snapshot from 'src/common/Snapshot';
import { INewRequestBloc } from './NewRequestBloc';
import NewRequestContext from './NewRequestContext';

interface IProps {
  key?: Key,
}

class RequestKeyDialog extends React.Component<IProps> {
  public render() {
    return (
      <NewRequestContext.Consumer>
        {bloc => {          
          let dialogResult: boolean;
          const onEnter = () => {
            dialogResult = false;
            prepareBackNavigation(() => bloc.onRequestKeyDialogClose.next(dialogResult));
          };
          const close = (result: boolean) => {
            dialogResult = result;
            executeBackNavigation();
          };
          const onClose = () => close(false);
          const onEntered = () => bloc.onRequestKeyDialogEntered.next();
          const onExited = () => bloc.onRequestKeyDialogExited.next();
          return (
            <Snapshot source={bloc.requestKeyDialogKey} initialValue={""}>
              {(key: string | number) => (
                <Snapshot source={bloc.requestKeyDialogOpen} initialValue={false}>
                  {(open: boolean) => (
                    <Dialog
                      key={key}
                      open={open}
                      onClose={onClose}
                      onEnter={onEnter}
                      onEntered={onEntered}
                      onExited={onExited}
                    >
                      {this.renderDialogContent(bloc, close)}
                    </Dialog>
                  )}
                </Snapshot>
              )}
            </Snapshot>
          )
        }}
      </NewRequestContext.Consumer>
    )
  }

  private renderDialogContent(bloc: INewRequestBloc, close: (result: boolean) => void) {
    const onDone = () => { close(true); };
    const onCancel = () => { close(false); };
    return (
      <React.Fragment>
        <DialogTitle>リクエストキーの入力</DialogTitle>
        <DialogContent>
          <DialogContentText>
            リクエストキーを入力してください。
            リクエストキーは動画鑑賞会の開催ごとに異なり、事前に、または当日の会場で、参加者に公開されます。
          </DialogContentText>
          <Snapshot source={bloc.requestKeyDialogValue} initialValue="">
            {(value: string) => {
              const onChange: React.ChangeEventHandler<HTMLInputElement> = event => {
                bloc.onRequestKeyDialogValueChanged.next(event.target.value);
              };
              return (
                <TextField
                  type="text"
                  autoFocus={true}
                  label="リクエストキー"
                  margin="normal"
                  fullWidth={true}
                  onChange={onChange}
                />
              );
            }}
          </Snapshot>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">キャンセル</Button>
          <Button onClick={onDone} color="primary">OK</Button>
        </DialogActions>
      </React.Fragment>
    );
  }
}

export default RequestKeyDialog;
