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
import { List } from "@mui/icons-material";
import { VideoLabel } from "@mui/icons-material";

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
          <Typography variant="h6">
            MobConfVideo
          </Typography>
          <div style={{ flexGrow: 1 }} />
          <Tabs value={0}>
            <Tab label="受付済み" icon={<List/>}/>
            <Tab label="動画検索" icon={<VideoLabel/>}/>
          </Tabs>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
