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

import { AppBar, createTheme, Tab, Tabs, ThemeProvider, Toolbar, Typography } from "@mui/material";
import { List, VideoLabel } from "@mui/icons-material";
import { Link, Location, matchPath, useLocation } from "react-router-dom";

export function HomeAppBar(): JSX.Element {
  const appBarTheme = createTheme({
    palette: {
      primary: {
        main: "#f5c300",
        contrastText: "#fff",
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#11509a",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: "white",
            opacity: 0.7,
            "&.Mui-selected": {
              color: "white",
              opacity: 1.0,
            },
          },
        },
      },
    },
  });
  
  return (
    <ThemeProvider theme={appBarTheme}>
      <AppBar position="sticky">
        <Toolbar>
          <PageTitle/>
          <div style={{ flexGrow: 1 }} />
          <AppTabs/>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

function getTab({ pathname }: Location) {
  if (matchPath({ path: "/request", end: false }, pathname) !== null) {
    return "request";
  } else if (matchPath({ path: "/video", end: false }, pathname) !== null) {
    return "video";
  } else {
    return "request";
  }
}

function PageTitle(): JSX.Element {
  const location = useLocation();
  const tab = getTab(location);
  const title = (() => {
    switch (tab) {
      case "request":
        return "リクエスト一覧";
      case "video":
        return "動画を見つける";
      default:
        return "";
    }
  })();
  return (
    <Typography variant="h6">{title}</Typography>
  );
}

function AppTabs(): JSX.Element {
  const location = useLocation();
  const tab = getTab(location);
  
  return (
    <Tabs value={tab}>
      <Tab value="request" label="受付済み" icon={<List/>} to="/request" component={Link} />
      <Tab value="video" label="動画検索" icon={<VideoLabel/>} to="/video" component={Link}/>
    </Tabs>
  );
}
