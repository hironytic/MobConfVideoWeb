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
  IconButton, Stack,
  TextField,
  Typography
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Dropdown, DropdownState } from "../../utils/Dropdown";

interface SessionSearchFilterProps {
  isExpanded: boolean;
  onExpand: (isExpanded: boolean) => void;
}

export function SessionSearchFilter({ isExpanded, onExpand }: SessionSearchFilterProps): JSX.Element {
  // TODO: プロパティでObservableをもらうように
  const conferenceDropdownState: DropdownState = {
    value: "bar",
    items: [
      { value: "none", title: "なし" },
      { value: "foo", title: "FooFoo" },
      { value: "bar", title: "tvOSDC 2100 Japan Reject Conference" },
    ],
  };
  const sessionTimeDropdownState: DropdownState = {
    value: "min120",
    items: [
      { value: "min5", title: "5分" },
      { value: "min10", title: "10分" },
      { value: "min120", title: "120分" },
    ],
  };
  const keywordText = "";
  
  return (
    <Box sx={{ mt: 1, mb: 4, mx: "auto" }}>
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
          <CardContent>
            <Stack direction="column" spacing={3}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                <Dropdown labelId="conference" label="カンファレンス" state={conferenceDropdownState} minWidth={150} onChange={value => {}}/>
                <Dropdown labelId="minutes" label="セッション時間" state={sessionTimeDropdownState} minWidth={150} onChange={value => {}}/>
              </Stack>
              <TextField type="text" autoFocus={false}
                         label="キーワード" placeholder="スペースで区切って指定（AND検索）"
                         margin="none"
                         fullWidth={true}
                         onChange={event => console.log(event.target.value)}
                         value={keywordText}
                         InputLabelProps={{ shrink: true }}/>
            </Stack>
          </CardContent>
          
          <CardActions>
            <Grid container={true}>
              <Grid item={true} xs={12} sx={{ textAlign: "end" }}>
                <Button size="small" color="primary" onClick={() => {}}>実行</Button>
              </Grid>
            </Grid>
          </CardActions>
        </Collapse>
      </Card>
    </Box>
  );
}
