//
// SessionSearchFilter.tsx
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

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import { Dropdown, EMPTY_DROPDOWN } from "../../utils/Dropdown"
import React, { useContext, useEffect } from "react"
import { SessionContext } from "./SessionContext"
import { useObservableState } from "observable-hooks"
import { useSearchParams } from "react-router-dom"

export function SessionSearchFilter(): JSX.Element {
  const sessionLogic = useContext(SessionContext)
  const isExpanded = useObservableState(sessionLogic.isFilterPanelExpanded$, true)

  return (
    <Box sx={{ mt: 1, mb: 4, mx: "auto" }}>
      <SessionSearchFilterCard isExpanded={isExpanded} onExpand={(isExpanded) => sessionLogic.expandFilterPanel(isExpanded)}/>
    </Box>
  )
}

interface SessionSearchFilterCardProps {
  isExpanded: boolean
  onExpand: (isExpanded: boolean) => void
}
function SessionSearchFilterCard({ isExpanded, onExpand }: SessionSearchFilterCardProps): JSX.Element {
  const sessionLogic = useContext(SessionContext)
  const conference = useObservableState(sessionLogic.filterConference$, EMPTY_DROPDOWN)
  const sessionTime = useObservableState(sessionLogic.filterSessionTime$, EMPTY_DROPDOWN)
  const keyword = useObservableState(sessionLogic.filterKeywords$, "")
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const keywords = searchParams.get("q")
    if (keywords === null) { // When filter is not specified
      sessionLogic.clearFilter()
    } else { // When filter is specified
      // Execute specified filter.
      sessionLogic.executeFilter({
        conference: searchParams.get("c") ?? undefined,
        sessionTime: searchParams.get("t") ?? undefined,
        keywords,
      }, false)
    }
  }, [sessionLogic, searchParams, setSearchParams])
  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    // Convert form data to search params.
    const formData = new FormData(event.currentTarget)
    const params: Record<string, string> = {}
    const formDataToParams = (name: string, except: string | undefined, none: string | undefined) => {
      const data = formData.get(name)
      if (data !== null && typeof data === "string" && data !== except) {
        params[name] = data
      } else if (none !== undefined) {
        params[name] = none
      }
    }

    formDataToParams("q", undefined, "")
    formDataToParams("c", "-", undefined)
    formDataToParams("t", "-", undefined)
    
    sessionLogic.executeFilter({
      conference: params["c"] ?? undefined,
      sessionTime: params["t"] ?? undefined,
      keywords: params["q"] ?? "",
    }, true)
    setSearchParams(params)
  }
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container={true} alignItems="center">
          <Grid item={true} xs={6} style={{textAlign: "start"}}>
            <Typography variant="subtitle1" color="textPrimary">
              検索条件
            </Typography>
          </Grid>
          <Grid item={true} xs={6} sx={{ textAlign: "end" }}>
            <IconButton onClick={() => onExpand(!isExpanded)}>
              { isExpanded ? <ExpandLess/> : <ExpandMore/> }
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>

      <Collapse in={isExpanded}>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Stack direction="column" spacing={3}>
              <TextField type="text" name="q" autoFocus={false}
                         label="キーワード" placeholder="スペースで区切って指定（AND検索）"
                         margin="none"
                         fullWidth={true}
                         onChange={event => sessionLogic.filterKeywordsChanged(event.target.value)}
                         value={keyword}
                         InputLabelProps={{ shrink: true }}/>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                <Dropdown name="c" labelId="conference" label="カンファレンス" state={conference} minWidth={150} onChange={ value => sessionLogic.filterConferenceChanged(value) }/>
                <Dropdown name="t" labelId="minutes" label="セッション時間" state={sessionTime} minWidth={150} onChange={ value => sessionLogic.filterSessionTimeChanged(value) }/>
              </Stack>
            </Stack>
          </CardContent>
  
          <CardActions>
            <Grid container={true}>
              <Grid item={true} xs={12} sx={{ textAlign: "end" }}>
                <Button size="small" color="primary" type="submit">実行</Button>
              </Grid>
            </Grid>
          </CardActions>
        </form>
      </Collapse>
    </Card>
  )
}
