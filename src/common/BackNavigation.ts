//
// BackNavigation.ts
//
// Copyright (c) 2019 Hironori Ichimiya <hiron@hironytic.com>
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

const backNavigationId = new Date().getTime();
let currentHistoryNo = 0;
const actions: {[id: number]: () => void} = {};

export function prepareBackNavigation(action: () => void) {
  currentHistoryNo = window.history.state.historyNo;
  actions[currentHistoryNo] = action;
  currentHistoryNo++;
  window.history.pushState({
    backNavigationId,
    historyNo: currentHistoryNo,
  }, "");
}

export function executeBackNavigation() {
  window.history.back();
}

export function setupBackNavigation() {
  currentHistoryNo = 0;
  window.history.replaceState({
    backNavigationId,
    historyNo: currentHistoryNo,
  }, "");
  window.onpopstate = onPopState;
}

function onPopState(event: PopStateEvent) {
  if (event.state !== undefined
      && event.state.backNavigationId === backNavigationId
      && event.state.historyNo !== undefined) {
    const newHistoryNo = event.state.historyNo;
    if (newHistoryNo < currentHistoryNo) {
      for (let historyNo = currentHistoryNo - 1; historyNo >= newHistoryNo; historyNo--) {
        const action = actions[historyNo];
        delete actions[historyNo];
        if (action !== undefined) {
          action();
        }
      }
    }
    currentHistoryNo = newHistoryNo;
  }
}
