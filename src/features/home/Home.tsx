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

import { HomeAppBar, HomeTab, HomeTabs } from "./HomeAppBar";
import { Location, matchPath, Outlet, useLocation } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { Maintenance } from "./Maintenance";
import { useContext } from "react";
import { ConfigContext } from "../config/ConfigContext";
import { ObserveOrUndefined } from "../../utils/Observe";

export function Home(): JSX.Element {
  const configViewModel = useContext(ConfigContext);
  return (
    <>
      <CssBaseline />
      <ObserveOrUndefined source={configViewModel.isInMaintenance$}>
        {isInMaintenance => (isInMaintenance !== undefined) && (
          (isInMaintenance) ? <Maintenance /> : <OrdinaryHome/>
        )}
      </ObserveOrUndefined>
    </>
  );
}

function OrdinaryHome(): JSX.Element {
  const location = useLocation();
  const tab = getTab(location);
  return (
    <>
      <HomeAppBar title={pageTitle(tab)} tab={tab} />
      <Outlet/>
    </>
  );
}

function getTab({ pathname }: Location): HomeTab | undefined {
  if (matchPath({ path: "/request", end: false }, pathname) !== null) {
    return HomeTabs.Request;
  } else if (matchPath({ path: "/session", end: false }, pathname) !== null) {
    return HomeTabs.Session;
  } else {
    return undefined;
  }
}

function pageTitle(navRoute: HomeTab | undefined): string {
  switch (navRoute) {
    case HomeTabs.Request:
        return "リクエスト一覧";
    case HomeTabs.Session:
        return "動画を見つける";
    default:
        return "";
  }
}
