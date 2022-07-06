//
// Observe.ts
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

import { Observable } from "rxjs";
import { ReactNode, useEffect, useState } from "react";

interface ObserveProps<T> {
  source: Observable<T> | undefined;
  initialValue: T;
  children: (value: T) => ReactNode;
}

export function Observe<T>({ source, initialValue, children }: ObserveProps<T>): JSX.Element {
  const [value, updateValue] = useState(initialValue);
  
  useEffect(() => {
    const disposable = source?.subscribe(value => {
      updateValue(value);
    });
    return () => {
      disposable?.unsubscribe();
    };
  }, [source]);
  
  return (
    <>
      {children(value)}
    </>
  );
}

interface ObserveOrUndefinedProps<T> {
  source: Observable<T> | undefined;
  children: (value: T | undefined) => ReactNode;
}

export function ObserveOrUndefined<T>({ source, children }: ObserveOrUndefinedProps<T>): JSX.Element {
  const [value, updateValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    const disposable = source?.subscribe(value => {
      updateValue(value);
    });
    return () => {
      disposable?.unsubscribe();
    };
  }, [source]);

  return (
    <>
      {children(value)}
    </>
  );
}
