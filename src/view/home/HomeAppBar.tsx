//
// HomeAppBar.tsx
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

import { AppBar, Tab, Tabs, Toolbar, Typography } from "@material-ui/core";
import ListIcon from '@material-ui/icons/List';
import VideoIcon from '@material-ui/icons/VideoLabel';
import * as React from 'react';
import Snapshot from 'src/common/Snapshot';
import HomeContext from './HomeContext';

class HomeAppBar extends React.Component {
  public render() {
    return (
      <HomeContext.Consumer>
        {(bloc) => {
          const currentPageIndexChanged = (_: React.ChangeEvent<{}>, value: number) => bloc.currentPageIndexChanged.next(value);          
          return (
            <AppBar position="sticky">
              <Snapshot source={bloc.currentPageIndex} initialValue={0}>
                {(currentPageIndex: number) => (
                  <Toolbar>
                    <Typography variant="h6" color="inherit">
                      {this.getPageTitle(currentPageIndex)}
                    </Typography>
                    <div style={{flexGrow: 1}} />
                    <Tabs value={currentPageIndex} onChange={currentPageIndexChanged}>
                      <Tab label="リクエスト一覧" icon={<ListIcon />} />
                      <Tab label="動画を見つける" icon={<VideoIcon />} />
                    </Tabs>
                  </Toolbar>
                )}
              </Snapshot>                
            </AppBar>
          )
        }
      }
      </HomeContext.Consumer>
    );
  }

  private getPageTitle(pageIndex: number): string {
    switch (pageIndex) {
      case 0:
        return "リクエスト一覧";

      case 1:
        return "動画を見つける";

      default:
        return "";
    }
  }
}

export default HomeAppBar;
