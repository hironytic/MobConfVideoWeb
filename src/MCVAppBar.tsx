//
// MCVAppBar.tsx
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
import { Theme, withStyles } from '@material-ui/core/styles';
import ListIcon from '@material-ui/icons/List';
import VideoIcon from '@material-ui/icons/VideoLabel';
import * as React from 'react';

const styles = (theme: Theme) => ({
});

interface IProps {
  title: string,
  pageIndex: number,
  onPageIndexChange?: (event: React.ChangeEvent<{}>, value: any) => void
}

class MCVAppBar extends React.Component<IProps> {
  public render() {
    return (
      <AppBar position="static">
      <Toolbar>
        {/* <IconButton color="inherit" aria-label="Menu">
          <MenuIcon />
        </IconButton> */}
        <Typography variant="title" color="inherit">
          {this.props.title}
        </Typography>
        <div style={{flexGrow: 1}} />
        <Tabs value={this.props.pageIndex} onChange={this.props.onPageIndexChange}>
          <Tab label="リクエスト" icon={<ListIcon />} />
          <Tab label="動画" icon={<VideoIcon />} />
        </Tabs>
      </Toolbar>
    </AppBar>
    );
  }
}

export default withStyles(styles)(MCVAppBar);
