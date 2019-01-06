//
// NewRequestSnackbar.tsx
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

import { Snackbar } from '@material-ui/core';
import React, { Key } from 'react';
import Snapshot from 'src/common/Snapshot';
import NewRequestContext from './NewRequestContext';

interface IProps {
  key?: Key,
}

class NewRequestSnackbar extends React.Component<IProps> {
  public render() {
    return (
      <NewRequestContext.Consumer>
        {bloc => {
          const onClose = (_: React.SyntheticEvent<any>, reason: string) => {
            if (reason === 'clickaway') {
              return;
            }
            bloc.onSnackbarClose.next();
          }
          const onEntered = () => { bloc.onSnackbarEntered.next(); }
          const onExited = () => { bloc.onSnackbarExited.next(); }
          return (
            <Snapshot source={bloc.snackbarKey} initialValue={""}>
              {(key: string | number) => (
                <Snapshot source={bloc.snackbarOpen} initialValue={false}>
                  {(open: boolean) => (
                    <Snapshot source={bloc.snackbarMessage} initialValue="">
                      {(message: string) => (
                        <Snackbar
                          key={key}
                          anchorOrigin={{vertical: "bottom", horizontal: "left"}}
                          autoHideDuration={2750}
                          open={open}
                          onClose={onClose}
                          onEntered={onEntered}
                          onExited={onExited}
                          message={message}
                        />
                      )}
                    </Snapshot>
                  )}
                </Snapshot>
              )}
            </Snapshot>
          );
        }}
      </NewRequestContext.Consumer>
    );
  }
}

export default NewRequestSnackbar;
