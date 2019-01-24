//
// DefaultHomeBloc.test.ts
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

import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import DefaultHomeBloc from "./DefaultHomeBloc";
import { IHomeBloc } from './HomeBloc';

let bloc: IHomeBloc;
let subscription: Subscription;

beforeEach(() => {
  bloc = DefaultHomeBloc.create();
  subscription = new Subscription();
});

afterEach(() => {
  subscription.unsubscribe();
})

it("shows first page on beginning", async () => {
  const page = await bloc.currentPageIndex.pipe(
    take(1)
  ).toPromise();
  expect(page).toBe(0);
});

it("finally changes current page", done => {
  subscription.add(bloc.currentPageIndex.subscribe(page => {
    try {
      expect(page).toBe(1);
      done();
    } catch (error) {
      return;
    }
  }));
  bloc.currentPageIndexChanged.next(1);
});
