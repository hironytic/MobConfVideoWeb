//
// HomeAppBar.tsx
//
// Copyright (c) 2018-2022 Hironori Ichimiya <hiron@hironytic.com>
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

import { Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { List, VideoLabel } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { AppBar } from "../../utils/AppBar";

export const HomeTabs = {
  Request: "request",
  Session: "session",
} as const;

export type HomeTab = typeof HomeTabs[keyof typeof HomeTabs];

interface HomeAppBarProps {
  title: string;
  tab: HomeTab | undefined;
}

export function HomeAppBar({ title, tab }: HomeAppBarProps): JSX.Element {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6">{title}</Typography>
        <div style={{ flexGrow: 1 }} />
        <AppTabs tab={tab}/>
      </Toolbar>
    </AppBar>
  );
}


function AppTabs( { tab }: { tab: HomeTab | undefined }): JSX.Element {
  return (
    <Tabs value={tab ?? false}>
      <Tab value={HomeTabs.Request} label="受付済み" icon={<List/>} to="/request" component={Link} />
      <Tab value={HomeTabs.Session} label="動画検索" icon={<VideoLabel/>} to="/session" component={Link}/>
    </Tabs>
  );
}
