//
// DefaultNewRequestBloc.ts
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
import asObserver from 'src/common/AsObserver';
import ModalLogic from 'src/common/ModalLogic';
import { sleep } from 'src/common/Sleep';
import { IRequestRepository } from 'src/repository/RequestRepository';
import { IAddRequestFromSessionParams, INewRequestBloc } from "./NewRequestBloc";

class DefaultNewRequestBloc implements INewRequestBloc {
  public static create(
    requestRepository: IRequestRepository,
  ): DefaultNewRequestBloc {
    let storedRequestKey: string | undefined;
    const requestKeyDialogValue = new BehaviorSubject<string>("");
    const requestKeyDialogLogic = new ModalLogic<boolean>(() => {
      requestKeyDialogValue.next("");
    });

    const snackbarMessage = new BehaviorSubject<string>("");
    const snackbarLogic = new ModalLogic((message: string) => {
      snackbarMessage.next(message);
    });

    async function onAddRequestFromSession(params: IAddRequestFromSessionParams) {
      let tryAgain = false;
      let tryCount = 0;
      do {
        tryAgain = false;
        tryCount++;
        if (tryCount > 3) {
          // forbid user to try another request code repeatedly
          await sleep(5000);
          tryCount = 1;
        }
        if (storedRequestKey === undefined) {
          const done = await requestKeyDialogLogic.show();
          if (!done) {
            return;
          }
          storedRequestKey = requestKeyDialogValue.value;
        }
        if (storedRequestKey === "") {
          storedRequestKey = undefined;
          tryAgain = true;
        } else {
          try {
            await requestRepository.addRequestFromSession({
              requestKey: storedRequestKey,
              sessionId: params.sessionId,
            });
            snackbarLogic.show("リクエストを送信しました。");
          } catch (error) {
            if (error.details === "invalid_request_key") {
              storedRequestKey = undefined;
              tryAgain = true;
            } else {
              snackbarLogic.show("エラー: リクエストを送信できませんでした。");
            }
          }
        }
      } while(tryAgain);
    }

    return new DefaultNewRequestBloc(
      asObserver(onAddRequestFromSession),
      requestKeyDialogValue,
      requestKeyDialogLogic.onClose,
      requestKeyDialogLogic.onExited,
      snackbarLogic.onClose,
      snackbarLogic.onExited,
      requestKeyDialogLogic.key,
      requestKeyDialogLogic.open,
      requestKeyDialogValue,
      snackbarLogic.key,
      snackbarLogic.open,
      snackbarMessage,
    );
  }

  private constructor(
    // inputs
    public addRequestFromSession: Observer<IAddRequestFromSessionParams>,
    public onRequestKeyDialogValueChanged: Observer<string>,
    public onRequestKeyDialogClose: Observer<boolean>,
    public onRequestKeyDialogExited: Observer<void>,
    public onSnackbarClose: Observer<void>,
    public onSnackbarExited: Observer<void>,

    // outputs
    public requestKeyDialogKey: Observable<string | number>,
    public requestKeyDialogOpen: Observable<boolean>,
    public requestKeyDialogValue: Observable<string>,
    public snackbarKey: Observable<string | number>,
    public snackbarOpen: Observable<boolean>,
    public snackbarMessage: Observable<string>,
  ) { }

  public dispose() {
    return;
  }

}

export default DefaultNewRequestBloc;
