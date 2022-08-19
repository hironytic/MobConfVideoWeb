//
// Description.tsx
//
// Copyright (c) 2019-2022 Hironori Ichimiya <hiron@hironytic.com>
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

import { Typography } from "@mui/material";

interface DescriptionProps {
  description: string;
}
export function Description({ description }: DescriptionProps): JSX.Element {
  const lines = description.split(/\r\n|\r|\n/);
  return (
    <>
      {lines.map((line, index) => (
        <Typography key={index} variant="body2" color="textPrimary">
          {line.length > 0 ? preserveBeginningSpace(line) : (<br/>)}
        </Typography>
      ))}
    </>
  );
}

function preserveBeginningSpace(line: string): string {
  let prefix = "";
  while (line.charAt(0) === " ") {
    prefix = prefix + "\u00a0";
    line = line.substring(1);
  }
  if (prefix.length > 0) {
    return prefix + line;
  } else {
    return line;
  }
}
