//
// IRDE.ts
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

export const IRDETypes = {
  Initial: "Initial",
  Running: "Running",
  Done: "Done",
  Error: "Error",
} as const;

export type IRDEType = typeof IRDETypes[keyof typeof IRDETypes];

type IRDEInitial<Props> = {
  type: typeof IRDETypes.Initial;
} & Props;

type IRDERunning<Props> = {
  type: typeof IRDETypes.Running;
} & Props;

type IRDEDone<Props> = {
  type: typeof IRDETypes.Done;
} & Props;

type IRDEError<Props> = {
  type: typeof IRDETypes.Error;
} & Props;

/** Union of four states -- initial, running, done and error */
export type IRDE<IProps, RProps, DProps, EProps> = IRDEInitial<IProps> | IRDERunning<RProps> | IRDEDone<DProps> | IRDEError<EProps>;
