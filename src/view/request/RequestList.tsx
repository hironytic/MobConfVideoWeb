//
// RequestList.tsx
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

import { Card, CardActionArea, CircularProgress, Grid, Theme, Typography, withTheme } from '@material-ui/core';
import grey from '@material-ui/core/colors/grey';
import CheckIcon from '@material-ui/icons/Check';
import React, { Key } from 'react';
import Snapshot from 'src/common/Snapshot';
import Request from 'src/model/Request';
import RequestDetailContext from '../request_detail/RequestDetailContext';
import SessionDetailContext from '../session_detail/SessionDetailContext';
import { IRequestList, IRequestListError, IRequestListLoaded, RequestListState } from './RequestBloc';
import RequestContext from './RequestContext';

interface IProps {
  key?: Key,
  theme: Theme,
}

class RequestList extends React.Component<IProps> {
  public render() {
    return (
      <RequestContext.Consumer>
        {(bloc) => (
          <Snapshot source={bloc.currentEventId} initialValue={false}>
            {(currentEventId: string | false) => {
              if (currentEventId === false) {
                return (<React.Fragment/>);
              } else {
                return (
                  <Snapshot source={bloc.requestList} initialValue={{state: RequestListState.NotLoaded}}>
                    {(requestList: IRequestList) => this.renderBody(currentEventId, requestList)}
                  </Snapshot>
                );
              }
            }}
          </Snapshot>
        )}
      </RequestContext.Consumer>
    );
  }

  private renderBody(currentEventId: string, requestList: IRequestList) {
    switch (requestList.state) {
      case RequestListState.NotLoaded:
        return (<React.Fragment/>);

      case RequestListState.Loading:
        return this.renderLoadingBody();
      
      case RequestListState.Loaded:
        return this.renderLoadedBody(currentEventId, requestList);
      
      case RequestListState.Error:
        return this.renderErrorBody(requestList);
    }
  }

  private renderLoadingBody() {
    return (
      <div style={{
        marginTop: 70,
      }}>
        <CircularProgress/>
      </div>
    );
  }

  private renderLoadedBody(currentEventId: string, loaded: IRequestListLoaded) {
    if (loaded.requests.length === 0) {
      return (
        <div style={{
          marginTop: 70,
        }}>
          <Typography variant="body1" color="textSecondary">
            リクエストがありません
          </Typography>
        </div>  
      )
    }

    return (
      <div style={{
        marginTop: 20,
        padding: 20,
      }}>
        <Grid container={true}
              spacing={24}
              alignItems="flex-start">
          {loaded.requests.map((request) => this.renderRequestItem(currentEventId, request))}
        </Grid>
      </div>
    );
  }

  private renderRequestItem(currentEventId: string, request: Request) {
    const cardStyle: React.CSSProperties = {
      marginLeft: "auto",
      marginRight: "auto",
      textAlign: "start",
    };
    if (request.isWatched) {
      cardStyle.backgroundColor = grey["100"];
    }
    return (
      <Grid key={request.id} item={true} xs={12} md={6} lg={4}>
        <Card style={cardStyle}>
          <SessionDetailContext.Consumer>
            {sessionDetailBloc => (
              <RequestDetailContext.Consumer>
                {requestDetailBloc => {
                  const onClick = () => {
                    if (request.sessionId !== undefined) {
                      sessionDetailBloc.showSession.next({sessionId: request.sessionId, canRequest: false});
                    } else {
                      requestDetailBloc.showRequest.next({eventId: currentEventId, requestId: request.id});
                    }
                  };
                  return (
                    <CardActionArea style={{padding: 20}} onClick={onClick}>
                      <Grid container={true} spacing={16} justify="space-between">
                        <Grid item={true} xs={6}>
                          <Typography variant="body1" color="textSecondary">
                            {request.conference}
                          </Typography>
                        </Grid>
                        <Grid item={true} xs={6} style={{textAlign: "end"}}>
                          {(request.minutes) ? (
                            <Typography variant="body1" color="textSecondary">
                              {request.minutes}分
                            </Typography>
                          ) : (<React.Fragment/>)}
                        </Grid>
                        <Grid item={true} xs={12}>
                          <Typography variant="headline" color="textPrimary">
                            {request.title}
                          </Typography>
                        </Grid>
                        <Grid item={true} xs={12} style={{textAlign: "end"}}>
                          <Grid item={true}>
                            {(request.isWatched) ? (
                              <CheckIcon nativeColor="green" />
                            ) : (
                              <React.Fragment/>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardActionArea>
                  );
                }}
              </RequestDetailContext.Consumer>
            )}
          </SessionDetailContext.Consumer>
        </Card>
      </Grid>
    );
  }

  private renderErrorBody(error: IRequestListError) {
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

export default withTheme()(RequestList);
