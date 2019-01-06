//
// ModalLogic.ts
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

import { BehaviorSubject, Observable, Observer } from 'rxjs';
import asObserver from './AsObserver';

interface IQueueItem<R, P> {
  param: P;
  resolve: (result: R) => void;
}

class ModalLogic<R = void, P = void> {
  // input
  public onClose: Observer<R>;
  public onExited: Observer<void>;

  // output
  public key: Observable<string | number>;
  public open: Observable<boolean>;

  public show: (param: P) => Promise<R>;

  constructor(prepare: (param: P) => void = _ => { return }) {
    const queue: Array<IQueueItem<R, P>> = [];

    const key = new BehaviorSubject<string | number>(0);
    const open = new BehaviorSubject<boolean>(false); 

    function show(param: P): Promise<R> {
      return new Promise<R>(
        (resolve) => {
          queue.push({param, resolve});
          openIfNeeded();
        }
      );
    }
  
    function onClose(result: R) {
      open.next(false);
      const item = queue.shift();
      if (item !== undefined) {
        item.resolve(result);
      }
    }
  
    function onExited() {
      openIfNeeded();
    }
  
    function openIfNeeded() {
      if (open.value) {
        return;
      }
  
      if (queue.length > 0) {
        key.next(new Date().getTime());
        prepare(queue[0].param);
        open.next(true);
      }
    }
  
    this.onClose = asObserver(onClose);
    this.onExited = asObserver(onExited);

    this.key = key;
    this.open = open;

    this.show = show;
  }
}

export default ModalLogic;
