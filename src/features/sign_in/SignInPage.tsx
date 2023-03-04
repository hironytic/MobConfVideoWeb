//
// SignInPage.tsx
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

import { Box, Button, Typography } from "@mui/material"
import { useContext } from "react"
import { SignInContext } from "./SignInContext"
import { useObservableState } from "observable-hooks"

export function SignInPage(): JSX.Element {
  const logic = useContext(SignInContext)
  const isAuthenticated = useObservableState(logic.isAuthenticated$, false)
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ textAlign: "center" }}>
        {(isAuthenticated) ? <Authenticated/> : <Unauthenticated/>}
      </Box>
    </Box>
  )
}

function Authenticated(): JSX.Element {
  const logic = useContext(SignInContext)
  return (
    <>
      <Typography>認証済み</Typography>
      <Button variant="contained" onClick={() => void logic.signOut() }>サインアウト</Button>
    </>
  )
}

function Unauthenticated(): JSX.Element {
  const logic = useContext(SignInContext)
  return (
    <>
      <Button variant="contained" onClick={() => void logic.signInWithGoogle() }>Googleでサインイン</Button>
    </>
  )
}

// function SignInWithGoogle(): JSX.Element {
//   const logic = useContext(SignInContext)
//   const isSignInButtonVisible = useObservableState(logic.isSignInWithGoogleButtonVisible$, false)
//   const isSignOutButtonVisible = useObservableState(logic.isSignOutOfGoogleButtonVisible$, false)
//  
//   return (
//     <>
//       {(isSignInButtonVisible) && (
//         <Button variant="contained" onClick={() => void logic.signInWithGoogle() }>Googleでサインイン</Button>
//       )}
//       {(isSignOutButtonVisible) && (
//         <Button variant="contained">Googleとの連携を解除</Button>
//       )}
//     </>
//   )
// }
