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

import { Avatar, Card, CardActionArea, CircularProgress, Grid, StyledComponentProps, Theme, Typography, withStyles } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import React, { Fragment } from 'react';
import Snapshot from 'src/common/Snapshot';
import Speaker from 'src/model/Speaker';
import SessionDetailContext from '../session_detail/SessionDetailContext';
import { IIdAndName, ISessionItem, ISessionList, ISessionListError, ISessionListLoaded, SessionListState } from './VideoBloc';
import VideoContext from './VideoContext';

interface IBoldRange {
  offset: number,
  length: number,
}
interface ILineWithBoldRange {
  line: string,
  boldRanges: IBoldRange[],
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
        return this.renderLoadedBody(sessionList);
      
      case SessionListState.Error:
        return this.renderErrorBody(sessionList);
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

    // sort keywords in order from longest to shortest
    const keywordList = [...loaded.keywordList].sort((left, right) => right.length - left.length)
    return (
      <Grid container={true}
            spacing={24}
            alignItems="flex-start">
        {loaded.sessions.map((sessionItem) => this.renderSessionItem(sessionItem, keywordList))}
      </Grid>
    )
  }

  private renderSessionItem(sessionItem: ISessionItem, keywordList: string[]) {
    const sessionTitleLwbr = this.detectBoldRange(sessionItem.session.title, keywordList);
    return (
      <Grid key={sessionItem.session.id} item={true} xs={12}>
        <Card style={{
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "start",
        }}>
          <SessionDetailContext.Consumer>
            {(bloc) => {
              const sessionTapped = () => {
                bloc.showSession.next({sessionId: sessionItem.session.id, canRequest: true});
              };
              return (
                <CardActionArea style={{padding: 20}} onClick={sessionTapped}>
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
                        {this.renderBold(sessionTitleLwbr)}
                      </Typography>
                    </Grid>
                    <Grid item={true} xs={12}>
                      {this.renderDescription(sessionItem.session.description, keywordList)}
                    </Grid>
                    <Grid item={true} xs={12}>
                      {sessionItem.session.speakers.map((speaker, index) => this.renderSpeaker(speaker, index, keywordList))}
                    </Grid>
                  </Grid>
                </CardActionArea>
              );
            }}
          </SessionDetailContext.Consumer>
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

  private renderDescription(description: string, keywordList: string[]) {
    const maxLines = 3;
    const maxChars = 140;

    const lines = description.split(/\r\n|\r|\n/);
    const lineWithBoldRanges: ILineWithBoldRange[] = lines.map(line => this.detectBoldRange(line, keywordList))

    const displayLines: ILineWithBoldRange[] = [];
    const firstKeywordLine = lineWithBoldRanges.findIndex(lwbr => lwbr.boldRanges.length > 0);
    if (firstKeywordLine === -1) {
      // the case that no keywords are found in description
      let count = 0;
      for (const line of lines) {
        if (displayLines.length >= maxLines) {
          displayLines.push({line: "…", boldRanges: []});
          break;
        }

        const length = line.length;
        if (count + length < maxChars) {
          count += length;
          displayLines.push({line, boldRanges: []});
        } else {
          displayLines.push({line: line.substr(0, maxChars - count) + "…", boldRanges: []});
          break;
        }
      }
    } else {
      // the case that keywords are found in description
      let count = 0;
      for (let lineIndex = firstKeywordLine; lineIndex < lineWithBoldRanges.length; lineIndex++) {
        if (displayLines.length >= maxLines) {
          displayLines.push({line: "…", boldRanges: []});
          break;
        }

        let lwbr = lineWithBoldRanges[lineIndex];
        if (lineIndex === firstKeywordLine) {
          if (lwbr.boldRanges[0].offset > maxChars / 2) {
            const beginOffset = lwbr.boldRanges[0].offset - Math.floor(maxChars / 2);
            const beginOffset2 = beginOffset - "…".length;
            lwbr = {
              line: "…" + lwbr.line.substring(beginOffset),
              boldRanges: lwbr.boldRanges.map(range => ({offset: range.offset - beginOffset2, length: range.length})),
            }
          } else {
            if (firstKeywordLine > 0) {
              displayLines.push({line: "…", boldRanges: []});
            }
          }
        }
        const length = lwbr.line.length;
        if (count + length < maxChars) {
          count += length;
          displayLines.push({line: lwbr.line, boldRanges: lwbr.boldRanges});
        } else {
          displayLines.push({line: lwbr.line.substr(0, maxChars - count) + "…", boldRanges: lwbr.boldRanges.filter(range => range.offset + range.length <= maxChars - count)});
          break;
        }
      }
    }

    return displayLines.map((lwbr, index) => (
      <Typography key={index} variant="body1" color="textPrimary">
        {lwbr.line.length > 0 ? this.renderBold(lwbr) : (<br/>)}
      </Typography>
    ));
  }

  private renderSpeaker(speaker: Speaker, index: number, keywordList: string[]) {
    const lwbr = this.detectBoldRange(speaker.name, keywordList);
    return (
      <Grid key={index} container={true} spacing={8} alignItems="center" justify="flex-start">
        <Grid item={true}>
          <Avatar src={speaker.icon}/>
        </Grid>
        <Grid item={true}>
          <Typography variant="body1" color="textPrimary">
            {this.renderBold(lwbr)}
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

  private detectBoldRange(line: string, keywordList: string[]): ILineWithBoldRange {
    let searchOffset = 0;
    let nextRange: IBoldRange | null;
    const boldRanges: IBoldRange[] = [];
    do {
      // assume that keywordList is sorted in order from longest to shortest
      nextRange = keywordList.reduce((acc, keyword) => {
        const offset = line.indexOf(keyword, searchOffset);
        if (offset >= 0 && (acc === null || offset < acc.offset)) {
          return {offset, length: keyword.length};
        } else {
          return acc;
        }
      }, null as (IBoldRange | null));
      if (nextRange !== null) {
        boldRanges.push(nextRange);
        searchOffset = nextRange.offset + nextRange.length;
      }
    } while (nextRange !== null);
    return { line, boldRanges };
  }

  private renderBold(lwbr: ILineWithBoldRange): JSX.Element[] {
    const elements: JSX.Element[] = [];
    let current = 0;
    for (const range of lwbr.boldRanges) {
      elements.push((<Fragment>{lwbr.line.substring(current, range.offset)}</Fragment>));
      elements.push((<b>{lwbr.line.substr(range.offset, range.length)}</b>));
      current = range.offset + range.length;
    }
    if (current < lwbr.line.length) {
      elements.push((<Fragment>{lwbr.line.substring(current, lwbr.line.length)}</Fragment>));
    }
    return elements;
  }
}

export default withStyles(styles)(SessionList);
