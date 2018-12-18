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

import { Avatar, Card, CardActionArea, Grid, Typography } from '@material-ui/core';
import React from 'react';

class SessionList extends React.Component {
  public render() {
    return (
      <Grid container={true}
            spacing={24}
            alignItems="center">
        { this.renderSessionItem() }
        { this.renderSessionItem() }
        { this.renderSessionItem() }
        { this.renderSessionItem() }
      </Grid>
    );
  }

  private renderSessionItem() {
    return (
      <Grid item={true} xs={12} lg={6}>
        <Card style={{
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "start",
        }}>
          <CardActionArea style={{padding: 20}}>
            <Grid container={true} spacing={16} justify="space-between">
              <Grid item={true} xs={6}>
                <Typography variant="body1" color="textSecondary">
                  iOSDC Japan 2036
                </Typography>
              </Grid>
              <Grid item={true} xs={6} style={{textAlign: "end"}}>
                <Typography variant="body1" color="textSecondary">
                  30分
                </Typography>
              </Grid>
              <Grid item={true} xs={12}>
                <Typography variant="subheading" color="textPrimary">
                  すべてのコードを自動生成すれば俺らもういらないんじゃね？
                </Typography>
              </Grid>
              <Grid item={true} xs={12}>
                <Typography variant="body1" color="textPrimary">
                  じゅげむじゅげむ、ごこうのすりきれ、かいじゃりすいぎょの水行末。雲来末、風来末、食う寝るところに住むところ。やぶらこうじのぶらこうじ、ぱいぽ・ぱいぽ・パイポのシューりんがん、しゅーりんがんのぐーりんたい、ぐーりんたいのぽんぽこぴーのぽんぽこなーのちょうきゅうめいのちょうすけ
                </Typography>
              </Grid>
              <Grid item={true} xs={12}>
                <Grid container={true} spacing={8} alignItems="center" justify="flex-start">
                  <Grid item={true}>
                    <Avatar src="https:\/\/fortee.jp\/files\/iosdc-japan-2018\/speaker\/20bbb736-e03d-4004-8165-ec39a690bd8f.jpg" />
                  </Grid>
                  <Grid item={true}>
                    <Typography variant="body1" color="textPrimary">
                      ひろん
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container={true} spacing={8} alignItems="center" justify="flex-start">
                  <Grid item={true}>
                    <Avatar src="https:\/\/fortee.jp\/files\/iosdc-japan-2018\/speaker\/20bbb736-e03d-4004-8165-ec39a690bd8f.jpg" />
                  </Grid>
                  <Grid item={true}>
                    <Typography variant="body1" color="textPrimary">
                      ひろん
                    </Typography>
                  </Grid>
                </Grid>

              </Grid>
            </Grid>
          </CardActionArea>
        </Card>
      </Grid>
    );
  }
}

export default SessionList;