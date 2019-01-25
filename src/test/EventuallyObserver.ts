//
// EventuallyObserver.ts
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

import { Observer } from 'rxjs';

type ExpectationResolve = (value?: void | PromiseLike<void>) => void;

interface IExpectation<T> {
  checker: (value: T) => void;
  resolve: ExpectationResolve;
}

export default class Eventually<T> implements Observer<T> {
  private static onReceived<T>(expectations: Array<IExpectation<T>>, value: T) {
    const resolves: ExpectationResolve[] = [];
    const resolvedIndices: number[] = [];
    for (let index = 0; index < expectations.length; index++) {
      const expectation = expectations[index];
      try {
        expectation.checker(value);
        resolves.push(expectation.resolve);
        resolvedIndices.push(index);
      } catch (e) {
        /* do nothing */
      }
    }
    resolvedIndices.reverse().forEach(index => {
      expectations.splice(index, 1);
    });
    resolves.forEach(resolve => {
      resolve();
    })
  }

  private nextExpectations: Array<IExpectation<T>> = [];
  private errorExpectations: Array<IExpectation<any>> = [];

  public next(value: T) {
    Eventually.onReceived(this.nextExpectations, value);
  }
  
  public error(err: any) {
    Eventually.onReceived(this.errorExpectations, err);
  }

  public complete() {
    /* do nothing */
  }

  public expectValue(checker: (value: T) => void): Promise<void> {
    return new Promise(resolve => {
      this.nextExpectations.push({
        checker,
        resolve,
      });
    });
  }

  public expectError(checker: (error: any) => void): Promise<void> {
    return new Promise(resolve => {
      this.errorExpectations.push({
        checker,
        resolve,
      });
    });
  }
}
