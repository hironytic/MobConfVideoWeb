//
// SessionList.tsx
//
// Copyright (c) 2018 Hironori Ichimiya <hiron@hironytic.com>
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

import { Avatar, Button, Card, CircularProgress, Grid, StyledComponentProps, Theme, Typography, withStyles } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import SlideIcon from '@material-ui/icons/Note';
import VideoIcon from '@material-ui/icons/OndemandVideo';
import React from 'react';
import Snapshot from 'src/common/Snapshot';
import Speaker from 'src/model/Speaker';
import { IIdAndName, ISessionItem, ISessionList, ISessionListError, ISessionListLoaded, SessionListState } from './VideoBloc';
import VideoContext from './VideoContext';

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
  }
});

class SessionList extends React.Component<StyledComponentProps> {
  public render() {
    return (
      <VideoContext.Consumer>
        {(bloc) => (
          <Snapshot source={bloc.sessionList} initialValue={{state: SessionListState.NotLoaded}}>
            {(sessionList: ISessionList) => this.renderBody(sessionList)}
          </Snapshot>
        )}
      </VideoContext.Consumer>
    );
  }

  private renderBody(sessionList: ISessionList) {
    switch (sessionList.state) {
      case SessionListState.NotLoaded:
        return (<React.Fragment/>);

      case SessionListState.Loading:
        return this.renderLoadingBody();
      
      case SessionListState.Loaded:
        return this.renderLoadedBody(sessionList.loaded!);
      
      case SessionListState.Error:
        return this.renderErrorBody(sessionList.error!);      
    }
  }

  private renderLoadingBody() {
    return (
      <div style={{
        marginTop: 50,
      }}>
        <CircularProgress/>
      </div>
    );
  }

  private renderLoadedBody(loaded: ISessionListLoaded) {
    if (loaded.sessions.length === 0) {
      return (
        <div style={{
          marginTop: 50,
        }}>
          <Typography variant="body1" color="textSecondary">
            動画セッションが見つかりません
          </Typography>
        </div>  
      )
    }

    return (
      <Grid container={true}
            spacing={24}
            alignItems="flex-start">
        {loaded.sessions.map((sessionItem) => this.renderSessionItem(sessionItem))}
      </Grid>
    )
  }

  private renderSessionItem(sessionItem: ISessionItem) {
    return (
      <Grid key={sessionItem.session.id} item={true} xs={12}>
        <Card style={{
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "start",
        }}>
          <div style={{padding: 20}}> {/* <CardActionArea style={{padding: 20}}> */}
            <Grid container={true} spacing={16} justify="space-between">
              <Grid item={true} xs={12}>
                <Grid container={true} spacing={16} justify="space-between">
                  <Grid item={true}>
                    <Typography variant="body1" color="textSecondary">
                      {sessionItem.conferenceName}
                    </Typography>
                  </Grid>
                  <Grid item={true} style={{textAlign: "end"}}>
                    <Typography variant="body1" color="textSecondary">
                      {sessionItem.session.minutes}分
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {this.renderWatchedEvents(sessionItem.watchedEvents)}
              <Grid item={true} xs={12}>
                <Typography variant="headline" color="textPrimary">
                  {sessionItem.session.title}              
                </Typography>
              </Grid>
              <Grid item={true} xs={12}>
                {this.renderDescription(sessionItem.session.description)}
              </Grid>
              <Grid item={true} xs={12}>
                <Grid container={true} spacing={0} alignItems="flex-end" justify="space-between">
                  <Grid item={true}>
                    {sessionItem.session.speakers.map((speaker, index) => this.renderSpeaker(speaker, index))}
                  </Grid>
                  <Grid item={true}>
                    <Grid container={true} spacing={0} alignItems="center" justify="flex-end">
                      <Grid item={true}>
                        {sessionItem.session.slide !== undefined ? (
                          <Button href={sessionItem.session.slide} target="_blank" color="primary">
                            <SlideIcon/> スライド
                          </Button>
                        ) : (
                          <React.Fragment/>
                        )}
                      </Grid>
                      <Grid item={true}>
                          <Button href={sessionItem.session.video} target="_blank" color="primary">
                            <VideoIcon/> ビデオ
                          </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div> {/* </CardActionArea> */}
        </Card>
      </Grid>
    );
  }

  private renderWatchedEvents(watchedEvents: IIdAndName[]) {
    if (watchedEvents.length === 0) {
      return (<React.Fragment/>);
    } else {
      return (
        <Grid item={true} xs={12}>
          <Grid container={true} spacing={16} justify="flex-start">
            {watchedEvents.map(event => (
              <Grid key={event.id} item={true}>
                <Typography variant="body1" color="textSecondary" className={this.props.classes!.watched}>
                  <CheckIcon className={this.props.classes!.watchedIcon} />{event.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
      );
    }
  }

  private renderDescription(description: string) {
    return description.split(/\r\n|\r|\n/).map((line, index) => (
      <Typography key={index} variant="body1" color="textPrimary">
        {line}
      </Typography>
    ));
  }

  private renderSpeaker(speaker: Speaker, index: number) {
    return (
      <Grid key={index} container={true} spacing={8} alignItems="center" justify="flex-start">
        <Grid item={true}>
          <Avatar src={speaker.icon}/>
        </Grid>
        <Grid item={true}>
          <Typography variant="body1" color="textPrimary">
            {speaker.name}
          </Typography>
        </Grid>
      </Grid>
    );   
  }

  private renderErrorBody(error: ISessionListError) {
    return (
      <div style={{
        marginTop: 70,
      }}>
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

export default withStyles(styles)(SessionList);
