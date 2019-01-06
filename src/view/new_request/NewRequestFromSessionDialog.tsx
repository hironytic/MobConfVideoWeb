//
// NewRequestFromSessionDialog.tsx
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

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React, { Key } from 'react';
import Snapshot from 'src/common/Snapshot';
import { INewRequestBloc } from './NewRequestBloc';
import NewRequestContext from './NewRequestContext';

interface IProps {
  key?: Key,
}

class NewRequestFromSessionDialog extends React.Component<IProps> {
  public render() {
    return (
      <NewRequestContext.Consumer>
        {bloc => {          
          const onClose = () => bloc.onNewRequestFromSessionDialogClose.next(false);
          const onEntered = () => bloc.onNewRequestFromSessionDialogEntered.next();
          const onExited = () => bloc.onNewRequestFromSessionDialogExited.next();
          return (
            <Snapshot source={bloc.newRequestFromSessionDialogKey} initialValue={""}>
              {(key: string | number) => (
                <Snapshot source={bloc.newRequestFromSessionDialogOpen} initialValue={false}>
                  {(open: boolean) => (
                    <Dialog
                      key={key}
                      open={open}
                      onClose={onClose}
                      onEntered={onEntered}
                      onExited={onExited}
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
    const onDone = () => { bloc.onNewRequestFromSessionDialogClose.next(true); };
    const onCancel = () => { bloc.onNewRequestFromSessionDialogClose.next(false); };
    return (
      <React.Fragment>
        <DialogTitle>リクエスト</DialogTitle>
        <DialogContent>
          <DialogContentText>
            この動画をリクエストします。よろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">キャンセル</Button>
          <Button onClick={onDone} color="primary">OK</Button>
        </DialogActions>
      </React.Fragment>
    );
  }
}

export default NewRequestFromSessionDialog;
