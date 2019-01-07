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
import { ISnackbarSetting } from './NewRequestBloc';
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
            bloc.snackbarBloc.onClose.next();
          }
          const onEntered = () => { bloc.snackbarBloc.onEntered.next(); }
          const onExited = () => { bloc.snackbarBloc.onExited.next(); }
          return (
            <Snapshot source={bloc.snackbarBloc.key} initialValue={""}>
              {(key: string | number) => (
                <Snapshot source={bloc.snackbarBloc.open} initialValue={false}>
                  {(open: boolean) => (
                    <Snapshot source={bloc.snackbarBloc.setting} initialValue={{message: "", autoHideDuration: undefined}}>
                      {(setting: ISnackbarSetting) => (
                        <Snackbar
                          key={key}
                          anchorOrigin={{vertical: "bottom", horizontal: "left"}}
                          autoHideDuration={setting.autoHideDuration}
                          open={open}
                          onClose={onClose}
                          onEntered={onEntered}
                          onExited={onExited}
                          message={setting.message}
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
