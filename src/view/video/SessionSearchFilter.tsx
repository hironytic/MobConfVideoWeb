//
// SessionSearchFilter.tsx
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

import { Button, Card, CardActions, CardContent, Collapse, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Typography } from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from 'react';
import { bindClickEvent } from 'src/common/ButtonUtils';
import DropdownState from 'src/common/DropdownState';
import { bindChangeEvent } from 'src/common/DropdownUtils';
import Snapshot from 'src/common/Snapshot';
import VideoContext from './VideoContext';

class SessionSearchFilter extends React.Component {
  public render() {
    return (
      <VideoContext.Consumer>
        {(bloc) => (
          <div style={{
            marginTop: 10,
            marginRight: "auto",
            marginLeft: "auto",
            marginBottom: 30,
            maxWidth: 400,
          }}>
            <Card>
              <CardContent>
                <Grid container={true} alignItems="center">
                  <Grid item={true} xs={6} style={{textAlign: "start"}}>
                    <Typography variant="body1" color="textPrimary">
                    検索条件
                    </Typography>
                  </Grid>
                  <Snapshot source={bloc.isFilterPanelExpanded} initialValue={false}>
                    {(isFilterpanelExpanded: boolean) => {
                      const expandFilterPanel = () => bloc.expandFilterPanel.next(!isFilterpanelExpanded);
                      return (
                        <Grid item={true} xs={6} style={{textAlign: "end"}}>
                          <IconButton onClick={expandFilterPanel}>
                            { isFilterpanelExpanded ? (<ExpandLessIcon/>) : (<ExpandMoreIcon/>) }
                          </IconButton>                          
                        </Grid>
                      );
                    }}
                  </Snapshot>
                </Grid>
              </CardContent>
              <Snapshot source={bloc.isFilterPanelExpanded}>
                {(isFilterpanelExpanded: boolean | undefined) => {
                  if (isFilterpanelExpanded === undefined) { return (<React.Fragment/>); }
                  return (
                    <Collapse in={isFilterpanelExpanded}>
                      <CardContent>
                        <Grid container={true} spacing={24}>
                          <Grid item={true} xs={12} style={{textAlign: "start"}}>
                            <Snapshot source={bloc.filterConference}>
                              {(data: DropdownState) => (data === undefined) ? (<React.Fragment/>) : (
                                <FormControl style={{minWidth: 150}}>
                                  <InputLabel htmlFor="conference">カンファレンス</InputLabel>
                                  <Select value={data.value}
                                          onChange={bindChangeEvent(bloc.filterConferenceChanged)}
                                          inputProps={{ id: 'conference' }}>
                                    {data.items.map((item) => (
                                      <MenuItem key={item.value} value={item.value}>
                                        {item.title}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            </Snapshot>
                          </Grid>
                          <Grid item={true} xs={12} style={{textAlign: "start"}}>
                            <Snapshot source={bloc.filterSessionTime}>
                              {(data: DropdownState) => (data === undefined) ? (<React.Fragment/>) : (
                                <FormControl style={{minWidth: 150}}>
                                  <InputLabel htmlFor="minutes">セッション時間</InputLabel>
                                  <Select value={data.value}
                                          onChange={bindChangeEvent(bloc.filterSessionTimeChanged)}
                                          inputProps={{ id: 'minutes' }}>
                                    {data.items.map((item) => (
                                      <MenuItem key={item.value} value={item.value}>
                                        {item.title}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            </Snapshot>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <Grid container={true}>
                          <Grid item={true} xs={12} style={{textAlign: "end"}}>
                            <Button size="small" color="primary" onClick={bindClickEvent(bloc.executeFilter)}>
                              実行
                            </Button>
                          </Grid>
                        </Grid>
                      </CardActions>
                    </Collapse>
                  );
                }}
              </Snapshot>  
            </Card>
          </div>
        )}
      </VideoContext.Consumer>
    );
  }
}

export default SessionSearchFilter;
