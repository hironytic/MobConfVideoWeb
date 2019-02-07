//
// ModalReflector.ts
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

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { IModalLogicInput, IModalLogicOutput } from 'src/common/ModalLogic';

export default class ModalReflector<R> {
  public visible: Observable<boolean>;

  private visibleSubject: BehaviorSubject<boolean>;

  constructor() {
    this.visibleSubject = new BehaviorSubject<boolean>(false);
    this.visible = this.visibleSubject;
  }

  public bindTo(bloc: IModalLogicInput<R> & IModalLogicOutput): Subscription {
    const visibleSubject = this.visibleSubject;
    return bloc.open.subscribe(open => {
      if (visibleSubject.value === open) {
        return;
      }

      if (open) {
        visibleSubject.next(true);
        bloc.onEntered.next();
      } else {
        visibleSubject.next(false);
        bloc.onExited.next();
      }
    });
  }
}
