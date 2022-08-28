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

import { Tab, Tabs, Toolbar, Typography } from "@mui/material"
import { List, VideoLabel } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { AppBar } from "../../utils/AppBar"
import { HomeTab, HomeTabs } from "./HomeLogic"
import { useContext } from "react"
import { HomeContext } from "./HomeContext"
import { useObservableState } from "observable-hooks"

export function HomeAppBar(): JSX.Element {
  const homeLogic = useContext(HomeContext)
  const isInMaintenance = useObservableState(homeLogic.isInMaintenance$, false)
  const title = useObservableState(homeLogic.title$, "")
  const tab = useObservableState(homeLogic.homeTab$, false)
  
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6">{isInMaintenance ? "メンテナンス中" : title}</Typography>
        <div style={{ flexGrow: 1 }} />
        <AppTabs tab={isInMaintenance ? false : tab}/>
      </Toolbar>
    </AppBar>
  )
}


function AppTabs( { tab }: { tab: HomeTab }): JSX.Element {
  return (
    <Tabs value={tab}>
      <Tab value={HomeTabs.Request} label="受付済み" icon={<List/>} to="/request" component={Link} />
      <Tab value={HomeTabs.Session} label="動画検索" icon={<VideoLabel/>} to="/session" component={Link}/>
    </Tabs>
  )
}
