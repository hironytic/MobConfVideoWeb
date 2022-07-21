//
// ViewModelProvider.tsx
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

import React, { useEffect, useState } from "react";

export interface ViewModel {
  dispose: () => void;
}

interface ViewModelProviderProps<VM extends ViewModel> {
  context: React.Context<VM>;
  creator: () => VM;
  children: React.ReactNode;
}
export function ViewModelProvider<VM extends ViewModel>({ context, creator, children }: ViewModelProviderProps<VM>): JSX.Element {
  const [viewModel, setViewModel] = useState<VM | undefined>(undefined);
  useEffect(() => {
    const viewModel = creator();
    setViewModel(viewModel);
    return () => {
      viewModel.dispose();
    }
  }, [creator]);
  
  if (viewModel !== undefined) {
    const Provider = context.Provider;
    return (
      <Provider value={viewModel}>
        {children}
      </Provider>
    )
  } else {
    return <></>;
  }
}
