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
  public onEntered: Observer<void>;
  public onExited: Observer<void>;

  // output
  public key: Observable<string | number>;
  public open: Observable<boolean>;

  public show: (param: P) => Promise<R>;

  constructor(prepare: (param: P) => void = _ => { return }, closePrevious?: () => R) {
    const queue: Array<IQueueItem<R, P>> = [];

    const key = new BehaviorSubject<string | number>(0);
    const open = new BehaviorSubject<boolean>(false);
    let modalResolve: ((result: R) => void) | undefined;
    let modalResult: R | undefined;

    enum Status {
      closed,
      closing,
      opening,
      opened,
    }
    let status: Status = Status.closed;

    function show(param: P): Promise<R> {
      return new Promise<R>(
        (resolve) => {
          queue.push({param, resolve});
          if (closePrevious !== undefined && status === Status.opened) {
            onClose(closePrevious());
          } else {
            openIfNeeded();
          }
        }
      );
    }
  
    function onClose(result: R) {
      status = Status.closing;
      modalResult = result;
      open.next(false);
    }
  
    function onEntered() {
      status = Status.opened;
      if (closePrevious !== undefined && queue.length > 0) {
        onClose(closePrevious());
      }
    }

    function onExited() {
      modalResolve!(modalResult!);
      modalResolve = undefined;
      modalResult = undefined;
      status = Status.closed;
      openIfNeeded();
    }
  
    function openIfNeeded() {
      if (status !== Status.closed) {
        return;
      }
  
      if (queue.length > 0) {
        key.next(new Date().getTime());
        const item = queue.shift()!;
        prepare(item.param);
        modalResolve = item.resolve;
        open.next(true);
        status = Status.opening;
      }
    }
  
    this.onClose = asObserver(onClose);
    this.onEntered = asObserver(onEntered);
    this.onExited = asObserver(onExited);

    this.key = key;
    this.open = open;

    this.show = show;
  }
}

export default ModalLogic;
