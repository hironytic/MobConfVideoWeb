//
// TweetButton.tsx
//
// Copyright (c) 2023 Hironori Ichimiya <hiron@hironytic.com>
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

import { Button, createSvgIcon } from "@mui/material"

interface TweetButtonProps {
  text?: string
  url?: string
  hashtags?: string[]
}

export function createTweetUrl({ text, url, hashtags }: TweetButtonProps): string {
  const tweetUrl = new URL("https://twitter.com/intent/tweet")
  if (hashtags !== undefined && hashtags.length > 0) {
    tweetUrl.searchParams.set("hashtags", hashtags.join(","))
  }
  if (text !== undefined) {
    tweetUrl.searchParams.set("text", text)
  }
  if (url !== undefined) {
    tweetUrl.searchParams.set("url", url)
  }
  return tweetUrl.toString()
}

const XLogo = createSvgIcon(
  <svg viewBox="-200 -250 1400 1750" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/>
  </svg>,
  "X"
)

export function TweetButton(props: TweetButtonProps): JSX.Element {
  const tweetUrlString = createTweetUrl(props)
  
  return (
    <Button href={tweetUrlString} target="_blank" rel="noopener noreferrer" color="primary">
      <XLogo/> ポスト
    </Button>
  )
}
