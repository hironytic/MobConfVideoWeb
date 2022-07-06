//
// Home.tsx
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

import { HomeAppBar, HomeTab } from "./HomeAppBar";
import { Location, matchPath, Outlet, useLocation } from "react-router-dom";
import { CssBaseline } from "@mui/material";

export function Home(): JSX.Element {
  const location = useLocation();
  const tab = getTab(location);
  return (
    <>
      <CssBaseline />
      <HomeAppBar title={pageTitle(tab)} tab={tab} />
      <Outlet/>
    </>
  );
}

function getTab({ pathname }: Location): HomeTab | undefined {
  if (matchPath({ path: "/request", end: false }, pathname) !== null) {
    return HomeTab.Request;
  } else if (matchPath({ path: "/video", end: false }, pathname) !== null) {
    return HomeTab.Video;
  } else {
    return undefined;
  }
}

function pageTitle(navRoute: HomeTab | undefined): string {
  switch (navRoute) {
    case HomeTab.Request:
        return "リクエスト一覧";
    case HomeTab.Video:
        return "動画を見つける";
    default:
        return "";
  }
}
