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

import { Button } from "@mui/material"
import { Twitter } from "@mui/icons-material"

interface TweetButtonProps {
  text?: string
  url?: string
  hashtags?: string[]
}

export function TweetButton({ text, url, hashtags }: TweetButtonProps): JSX.Element {
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
  const tweetUrlString = tweetUrl.toString()
  
  return (
    <Button href={tweetUrlString} target="_blank" rel="noopener noreferrer" color="primary">
      <Twitter/> ツイート
    </Button>
  )
}
