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
          const onClose = () => bloc.closeRequestKeyDialog.next(false);
          return (
            <Snapshot source={bloc.requestKeyDialogKey} initialValue={""}>
              {(key: string | number) => (
                <Snapshot source={bloc.requestKeyDialogOpen} initialValue={false}>
                  {(open: boolean) => (
                    <Dialog
                      key={key}
                      open={open}
                      onClose={onClose}
                    >
                      {this.renderDialogContent(bloc)}
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

  private renderDialogContent(bloc: INewRequestBloc) {
    const onDone = () => { bloc.closeRequestKeyDialog.next(true); };
    const onCancel = () => { bloc.closeRequestKeyDialog.next(false); };
    return (
      <React.Fragment>
        <DialogTitle>リクエストキーの入力</DialogTitle>
        <DialogContent>
          <DialogContentText>
            リクエストキーを入力してください。
            リクエストキーはイベントごとに異なり、事前に、または、当日会場で参加者に公開されます。
          </DialogContentText>
          <Snapshot source={bloc.requestKeyDialogValue} initialValue="">
            {(value: string) => {
              const onChange: React.ChangeEventHandler<HTMLInputElement> = event => {
                bloc.requestKeyDialogValueChanged.next(event.target.value);
              };
              return (
                <TextField
                  autoFocus={true}
                  type="password"
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
