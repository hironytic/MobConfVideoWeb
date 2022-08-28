//
// RequestCard.tsx
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

import { Request } from "../../entities/Request"
import { Card, CardActionArea, Grid, SxProps, Typography } from "@mui/material"
import { lime, yellow } from "@mui/material/colors"
import { Check } from "@mui/icons-material"

interface RequestCardProps {
  request: Request
  onClick: () => void
}

export function RequestCard({ request, onClick }: RequestCardProps): JSX.Element {
  const cardSx: SxProps = {
    mx: "auto",
    textAlign: "start",
    backgroundColor: (request.isWatched) ? lime["50"] : yellow["100"],
  }
  
  return (
    <Card sx={cardSx}>
      <CardActionArea sx={{ p: 2 }} onClick={() => onClick()}>
        <Grid container={true} spacing={2} justifyContent="space-between">
          <Grid item={true} xs={6}>
            <Typography variant="body2" color="textSecondary">
              {request.conference}
            </Typography>
          </Grid>
          <Grid item={true} xs={6} style={{textAlign: "end"}}>
            {(request.minutes !== undefined) && (
              <Typography variant="body2" color="textSecondary">
                {request.minutes}分
              </Typography>
            )}
          </Grid>
          <Grid item={true} xs={12}>
            <Typography variant="h5" color="textPrimary">
              {request.title}
            </Typography>
          </Grid>
          <Grid item={true} xs={12} style={{textAlign: "end"}}>
            <Grid item={true}>
              {(request.isWatched) && (
                <Check htmlColor="green" />
              )}
            </Grid>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  )
}