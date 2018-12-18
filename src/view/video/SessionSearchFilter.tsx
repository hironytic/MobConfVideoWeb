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

import { Button, Card, CardActions, CardContent, Collapse, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from 'react';

class SessionSearchFilter extends React.Component {
  public render() {
    const isExpand = true;
    return (
      <div style={{margin: 10}}>
        <Card>
          <CardContent>
            <Grid container={true}>
              <Grid item={true} xs={6} style={{textAlign: "start"}}>
                <Typography variant="body1" color="textPrimary">
                検索条件
                </Typography>
              </Grid>
              <Grid item={true} xs={6} style={{textAlign: "end"}}>
                { isExpand ? (<ExpandLessIcon/>) : (<ExpandMoreIcon/>) }
              </Grid>
            </Grid>
          </CardContent>
          <Collapse in={isExpand}>
            <CardContent>
              <Grid container={true} spacing={24}>
                <Grid item={true} xs={12} style={{textAlign: "start"}}>
                  <FormControl style={{minWidth: 150}}>
                    <InputLabel htmlFor="conference">カンファレンス</InputLabel>
                    <Select value="kot"
                            // onChange={this.handleChange}
                            inputProps={{
                              id: 'conference',
                            }}>
                      <MenuItem value="a">指定なし</MenuItem>
                      <MenuItem value="ios">iOSDC</MenuItem>
                      <MenuItem value="kot">Kotlin</MenuItem>
                      <MenuItem value="ore">俺コン</MenuItem>
                    </Select>
                  </FormControl>              
                </Grid>
                <Grid item={true} xs={12} style={{textAlign: "start"}}>
                  <FormControl style={{minWidth: 150}}>
                    <InputLabel htmlFor="minutes">セッション時間</InputLabel>
                    <Select value="5min"
                            // onChange={this.handleChange}
                            inputProps={{
                              id: 'minutes',
                            }}>
                      <MenuItem value="a">指定なし</MenuItem>
                      <MenuItem value="5min">5分</MenuItem>
                      <MenuItem value="15min">15分</MenuItem>
                      <MenuItem value="30min">30分</MenuItem>
                    </Select>
                  </FormControl>              
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Grid container={true}>
                <Grid item={true} xs={12} style={{textAlign: "end"}}>
                  <Button size="small" color="primary">
                    実行
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Collapse>
        </Card>
      </div>
    );
  }
}

export default SessionSearchFilter;
