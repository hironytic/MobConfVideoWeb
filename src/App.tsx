//
// App.tsx
//
// Copyright (c) 2022 Hironori Ichimiya <hiron@hironytic.com>
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

import { HomeProvider } from "./features/home/HomeProvider"
import { RequestSubmissionProvider } from "./features/request_submission/RequestSubmissionProvider"
import { RequestProvider } from "./features/request/RequestProvider"
import { SessionProvider } from "./features/session/SessionProvider"
import { Home } from "./features/home/Home"
import { RequestSubmissionDialog } from "./features/request_submission/RequestSubmissionDialog"
import { RequestDetailProvider } from "./features/request_detail/RequestDetailProvider"
import { RequestDetailDialog } from "./features/request_detail/RequestDetailDialog"
import { SessionDetailProvider } from "./features/session_detail/SessionDetailProvider"
import { SessionDetailPage } from "./features/session_detail/SessionDetailPage"
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom"
import { RequestPage } from "./features/request/RequestPage"
import { SessionPage } from "./features/session/SessionPage"
import { useContext } from "react"
import { HomeContext } from "./features/home/HomeContext"
import { useObservableState } from "observable-hooks"
import { CssBaseline } from "@mui/material"
import { Maintenance } from "./features/home/Maintenance"
import { HomeIndex } from "./features/home/HomeIndex"

export function App(): JSX.Element {
  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Root/>}>
            <Route index element={<HomeIndex/>}/>
            <Route path="request" element={<Outlet/>}>
              <Route index element={<RequestPage/>}/>
              <Route path=":eventId" element={<RequestPage/>}>
                <Route path=":requestId" element={<RequestDetail/>}/>
              </Route>
            </Route>
            <Route path="session" element={<Outlet/>}>
              <Route index element={<SessionPage/>}/>
              <Route path=":sessionId" element={<SessionDetail/>}/>
            </Route>
            <Route path="*" element={<></>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

function Root(): JSX.Element {
  return (
    <HomeProvider>
      <HomeOrMaintenance/>
    </HomeProvider>
  )
}

function HomeOrMaintenance(): JSX.Element {
  const homeLogic = useContext(HomeContext)
  const isInMaintenance = useObservableState(homeLogic.isInMaintenance$)
  return (
    <>
      {(isInMaintenance !== undefined) && (
        (isInMaintenance) ? (
          <Maintenance/>
        ) : (
          <RequestSubmissionProvider>
            <RequestProvider>
              <SessionProvider>
                <Home/>
              </SessionProvider>
            </RequestProvider>
            <RequestSubmissionDialog/>
          </RequestSubmissionProvider>
        )
      )}      
    </>    
  )
}

function RequestDetail(): JSX.Element {
  return (
    <RequestDetailProvider>
      <RequestDetailDialog/>
    </RequestDetailProvider>
  )
}

function SessionDetail(): JSX.Element {
  return (
    <SessionDetailProvider>
      <SessionDetailPage/>
    </SessionDetailProvider>
  )
}
