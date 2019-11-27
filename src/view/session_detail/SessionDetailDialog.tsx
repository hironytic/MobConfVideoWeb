//
// SessionDetailDialog.tsx
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

import { AppBar, Avatar, Button, CircularProgress, Dialog, DialogActions, DialogContent, Grid, IconButton, StyledComponentProps, Theme, Toolbar, Typography, withStyles } from '@material-ui/core';
import withMobileDialog, { InjectedProps } from '@material-ui/core/withMobileDialog';
import CloseIcon from '@material-ui/icons/ArrowBack';
import CheckIcon from '@material-ui/icons/Check';
import SlideIcon from '@material-ui/icons/Note';
import VideoIcon from '@material-ui/icons/OndemandVideo';
import React, { Key } from 'react';
import { executeBackNavigation, prepareBackNavigation } from 'src/common/BackNavigation';
import Snapshot from 'src/common/Snapshot';
import Speaker from 'src/model/Speaker';
import NewRequestContext from '../new_request/NewRequestContext';
import { IIdAndName, ISessionDetail, ISessionDetailError, ISessionDetailLoaded, SessionDetailState } from './SessionDetailBloc';
import SessionDetailContext from './SessionDetailContext';

interface IProps extends StyledComponentProps, InjectedProps {
  key?: Key,
}

const styles = (theme: Theme) => ({
  watched: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: theme.shape.borderRadius,
    padding: theme.shape.borderRadius,
    borderColor: theme.palette.text.secondary,
  },
  watchedIcon: {
    fontSize: theme.typography.body1.fontSize,
    verticalAlign: "middle",
  },
});

class SessionDetailDialog extends React.Component<IProps> {
  public render() {
    return (
      <SessionDetailContext.Consumer key={this.props.key}>
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
                  <Snapshot source={bloc.sessionDetail} initialValue={{state: SessionDetailState.NotLoaded}}>
                    {(sessionDetail: ISessionDetail) => this.renderDialogContent(onClose, sessionDetail)}
                  </Snapshot>
                </Dialog>
              )}
            </Snapshot>
          )
        }}
      </SessionDetailContext.Consumer>
    );
  }

  private renderDialogContent(onClose: () => void, sessionDetail: ISessionDetail) {
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
            {this.renderBody(sessionDetail) }
          </DialogContent>
          <DialogActions>
            <React.Fragment />
          </DialogActions>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <DialogContent>
            {this.renderBody(sessionDetail) }
          </DialogContent>
          <DialogActions>
            <React.Fragment />
          </DialogActions>
        </React.Fragment>
      );
    }
  }

  private renderBody(sessionDetail: ISessionDetail) {
    switch (sessionDetail.state) {
      case SessionDetailState.NotLoaded:
        return (<React.Fragment/>);

      case SessionDetailState.Loading:
        return this.renderLoadingBody();
      
      case SessionDetailState.Loaded:
        return this.renderLoadedBody(sessionDetail);
      
      case SessionDetailState.Error:
        return this.renderErrorBody(sessionDetail);      
    }
  }

  private renderLoadingBody() {
    return (
      <div style={{textAlign: "center"}}>
        <CircularProgress/>
      </div>
    );
  }

  private renderLoadedBody(loaded: ISessionDetailLoaded) {
    return (
      <Grid container={true} spacing={2} justify="space-between">
        <Grid item={true} xs={12}>
          <Grid container={true} spacing={2} justify="space-between">
            <Grid item={true}>
              <Typography variant="body2" color="textSecondary">
                {loaded.session.conferenceName}
              </Typography>
            </Grid>
            <Grid item={true} style={{textAlign: "end"}}>
              <Typography variant="body2" color="textSecondary">
                {loaded.session.session.minutes}分
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        {this.renderWatchedEvents(loaded.session.watchedEvents)}
        <Grid item={true} xs={12}>
          <Typography variant="h5" color="textPrimary">
            {loaded.session.session.title}              
          </Typography>
        </Grid>
        <Grid item={true} xs={12}>
          {this.renderDescription(loaded.session.session.description)}
        </Grid>
        <Grid item={true} xs={12}>
          <Grid container={true} spacing={0} alignItems="flex-end" justify="space-between">
            <Grid item={true}>
              {loaded.session.session.speakers.map((speaker, index) => this.renderSpeaker(speaker, index))}
            </Grid>
            <Grid item={true} style={{flexGrow: 1}}>
              <Grid container={true} spacing={0} alignItems="center" justify="flex-end">
                <Grid item={true}>
                  {loaded.session.session.slide !== undefined ? (
                    <Button href={loaded.session.session.slide} target="_blank" color="primary">
                      <SlideIcon/> スライド
                    </Button>
                  ) : (
                    <React.Fragment/>
                  )}
                </Grid>
                <Grid item={true}>
                  {loaded.session.session.video !== undefined ? (
                    <Button href={loaded.session.session.video} target="_blank" color="primary">
                      <VideoIcon/> ビデオ
                    </Button>
                  ) : (
                    <React.Fragment/>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {(loaded.session.canRequest) ? (
          <Grid item={true} xs={12}>
            <Grid container={true} spacing={0} justify="center">
              <Grid item={true}>
                <NewRequestContext.Consumer>
                  {(bloc) => {
                    const onClick = () => bloc.addRequestFromSession.next({sessionId: loaded.session.session.id});
                    return (
                      <Button variant="contained" color="primary" onClick={onClick}>この動画をリクエスト</Button>
                    );
                  }}
                </NewRequestContext.Consumer>
              </Grid>
            </Grid>
          </Grid>
        ) : (<React.Fragment/>)}
      </Grid>
    );
  }

  private renderWatchedEvents(watchedEvents: IIdAndName[]) {
    if (watchedEvents.length === 0) {
      return (<React.Fragment/>);
    } else {
      return (
        <Grid item={true} xs={12}>
          <Grid container={true} spacing={2} justify="flex-start">
            {watchedEvents.map(event => (
              <Grid key={event.id} item={true}>
                <Typography variant="body2" color="textSecondary" className={this.props.classes!.watched}>
                  <CheckIcon className={this.props.classes!.watchedIcon} />{event.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
      );
    }
  }

  private preserveBeginningSpace(line: string): string {
    let prefix = "";
    while (line.charAt(0) === " ") {
      prefix = prefix + "\u00a0";
      line = line.substring(1);
    }
    if (prefix.length > 0) {
      return prefix + line;
    } else {
      return line;
    }
  }

  private renderDescription(description: string) {
    const lines = description.split(/\r\n|\r|\n/);
    return lines.map((line, index) => (
      <Typography key={index} variant="body2" color="textPrimary">
        {line.length > 0 ? this.preserveBeginningSpace(line) : (<br/>)}
      </Typography>
    ));
  }

  private renderSpeaker(speaker: Speaker, index: number) {
    return (
      <Grid key={index} container={true} spacing={1} alignItems="center" justify="flex-start">
        <Grid item={true}>
          <Avatar src={speaker.icon}/>
        </Grid>
        <Grid item={true}>
          <Typography variant="body2" color="textPrimary">
            {speaker.name}
          </Typography>
        </Grid>
      </Grid>
    );   
  }

  private renderErrorBody(error: ISessionDetailError) {
    return (
      <div style={{textAlign: "center"}}>
        <Typography variant="body2" color="error">
          エラーが発生しました
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {error.message}
        </Typography>
      </div>
    );
  }
}

export default withMobileDialog<IProps>({breakpoint: 'xs'})(withStyles(styles)(SessionDetailDialog));
