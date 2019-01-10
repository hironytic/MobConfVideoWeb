//
// RequestDetailDialog.tsx
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

import { AppBar, Button, CircularProgress, Dialog, DialogContent, Grid, IconButton, Toolbar, Typography } from '@material-ui/core';
import withMobileDialog, { InjectedProps } from '@material-ui/core/withMobileDialog';
import CloseIcon from '@material-ui/icons/ArrowBack';
import SlideIcon from '@material-ui/icons/Note';
import VideoIcon from '@material-ui/icons/OndemandVideo';
import React, { Key } from 'react';
import { executeBackNavigation, prepareBackNavigation } from 'src/common/BackNavigation';
import Snapshot from 'src/common/Snapshot';
import { IRequestDetail, IRequestDetailError, IRequestDetailLoaded, RequestDetailState } from './RequestDetailBloc';
import RequestDetailContext from './RequestDetailContext';

interface IProps extends InjectedProps {
  key?: Key;
}

class RequestDetailDialog extends React.Component<IProps> {
  public render() {
    return (
      <RequestDetailContext.Consumer key={this.props.key}>
        {(bloc) => {
          const onEnter = () => {
            prepareBackNavigation(() => bloc.dialogClosed.next());
          };
          const onClose = () => {
            executeBackNavigation();
          };
          return (
            <Snapshot source={bloc.dialogOpen} initialValue={false}>
              {(open: boolean) => (
                <Dialog                  
                  open={open}
                  onClose={onClose}
                  onEnter={onEnter}
                  fullScreen={this.props.fullScreen}
                  fullWidth={true}
                  maxWidth="xl"
                >
                  <Snapshot source={bloc.requestDetail} initialValue={{state: RequestDetailState.NotLoaded}}>
                    {(requestDetail: IRequestDetail) => this.renderDialogContent(onClose, requestDetail)}
                  </Snapshot>
                </Dialog>
              )}
            </Snapshot>
          )
        }}
      </RequestDetailContext.Consumer>
    );
  }

  private renderDialogContent(onClose: () => void, requestDetail: IRequestDetail) {
    if (this.props.fullScreen) {
      return (
        <React.Fragment>
          <AppBar>
            <Toolbar>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon/>
              </IconButton>
            </Toolbar>
          </AppBar>
          <DialogContent style={{paddingTop: 76}}>
            {this.renderBody(requestDetail) }
          </DialogContent>
        </React.Fragment>
      );
    } else {
      return (
        <DialogContent>
          {this.renderBody(requestDetail) }
        </DialogContent>
      );
    }
  }

  private renderBody(requestDetail: IRequestDetail) {
    switch (requestDetail.state) {
      case RequestDetailState.NotLoaded:
        return (<React.Fragment/>);

      case RequestDetailState.Loading:
        return this.renderLoadingBody();
      
      case RequestDetailState.Loaded:
        return this.renderLoadedBody(requestDetail);
      
      case RequestDetailState.Error:
        return this.renderErrorBody(requestDetail);      
    }
  }

  private renderLoadingBody() {
    return (
      <div style={{textAlign: "center"}}>
        <CircularProgress/>
      </div>
    );
  }

  private renderLoadedBody(loaded: IRequestDetailLoaded) {
    const request = loaded.request;
    return (
      <Grid container={true} spacing={16} justify="space-between">
        <Grid item={true} xs={12}>
          <Typography variant="body1" color="textSecondary">
            {request.conference}
          </Typography>
        </Grid>
        <Grid item={true} xs={12}>
          <Typography variant="headline" color="textPrimary">
            {request.title}
          </Typography>
        </Grid>
        <Grid item={true} xs={12}>
          <Grid container={true} spacing={0} alignItems="center" justify="flex-end">
            <Grid item={true}>
              {request.slideUrl !== undefined ? (
                <Button href={request.slideUrl} target="_blank" color="primary">
                  <SlideIcon/> スライド
                </Button>
              ) : (
                <React.Fragment/>
              )}
            </Grid>
            <Grid item={true}>
                <Button href={request.videoUrl} target="_blank" color="primary">
                  <VideoIcon/> ビデオ
                </Button>
            </Grid>
          </Grid>
        </Grid>              
      </Grid>
    );
  }

  private renderErrorBody(error: IRequestDetailError) {
    return (
      <div style={{textAlign: "center"}}>
        <Typography variant="body1" color="error">
          エラーが発生しました
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {error.message}
        </Typography>
      </div>
    );
  }

}

export default withMobileDialog<IProps>({breakpoint: 'xs'})(RequestDetailDialog);
