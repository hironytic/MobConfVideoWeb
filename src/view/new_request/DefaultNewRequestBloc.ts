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
import { sleep } from 'src/common/Sleep';
import { IRequestRepository } from 'src/repository/RequestRepository';
import { IAddRequestFromSessionParams, INewRequestBloc } from "./NewRequestBloc";

class DefaultNewRequestBloc implements INewRequestBloc {
  public static create(
    requestRepository: IRequestRepository,
  ): DefaultNewRequestBloc {
    let storedRequestKey: string | undefined;
    const requestKeyDialogQueue: Array<(done: boolean) => void> = [];
    const snackbarQueue: string[] = [];

    const requestKeyDialogKey = new BehaviorSubject<string | number>(0);
    const requestKeyDialogOpen = new BehaviorSubject<boolean>(false);
    const requestKeyDialogValue = new BehaviorSubject<string>("");
    const snackbarKey = new BehaviorSubject<string | number>(0);
    const snackbarOpen = new BehaviorSubject<boolean>(false);
    const snackbarMessage = new BehaviorSubject<string>("");

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
          const done = await showRequestKeyDialog();
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
            showSnackbar("リクエストを送信しました。");
          } catch (error) {
            if (error.details === "invalid_request_key") {
              storedRequestKey = undefined;
              tryAgain = true;
            } else {
              showSnackbar("エラー: リクエストを送信できませんでした。");
            }
          }
        }
      } while(tryAgain);
    }

    function showRequestKeyDialog(): Promise<boolean> {
      return new Promise<boolean>(
        (resolve) => {
          requestKeyDialogQueue.push(resolve);
          openRequestKeyDialogIfNeeded();
        }
      );
    }
    
    function onCloseRequestKeyDialog(done: boolean) {
      requestKeyDialogOpen.next(false);
      const resolve = requestKeyDialogQueue.shift();
      if (resolve !== undefined) {
        resolve(done);
      }
    }

    function onRequestKeyDialogExited() {
      openRequestKeyDialogIfNeeded();
    }

    function openRequestKeyDialogIfNeeded() {
      if (requestKeyDialogOpen.value) {
        return;
      }

      if (requestKeyDialogQueue.length > 0) {
        requestKeyDialogKey.next(new Date().getTime());
        requestKeyDialogValue.next("");
        requestKeyDialogOpen.next(true);
      }
    }

    function showSnackbar(message: string) {
      snackbarQueue.push(message);
      openSnackbarIfNeeded();
    }

    function onCloseSnackbar() {
      snackbarOpen.next(false);
      snackbarQueue.shift();
    }

    function onSnackbarExited() {
      openSnackbarIfNeeded();
    }

    function openSnackbarIfNeeded() {
      if (snackbarOpen.value) {
        return;
      }

      if (snackbarQueue.length > 0) {
        snackbarKey.next(new Date().getTime());
        snackbarMessage.next(snackbarQueue[0]);
        snackbarOpen.next(true);
      }
    }

    return new DefaultNewRequestBloc(
      asObserver(onAddRequestFromSession),
      requestKeyDialogValue,
      asObserver(onCloseRequestKeyDialog),
      asObserver(onRequestKeyDialogExited),
      asObserver(onCloseSnackbar),
      asObserver(onSnackbarExited),
      requestKeyDialogKey,
      requestKeyDialogOpen,
      requestKeyDialogValue,
      snackbarKey,
      snackbarOpen,
      snackbarMessage,
    );
  }

  private constructor(
    // inputs
    public addRequestFromSession: Observer<IAddRequestFromSessionParams>,
    public requestKeyDialogValueChanged: Observer<string>,
    public closeRequestKeyDialog: Observer<boolean>,
    public requestKeyDialogExited: Observer<void>,
    public closeSnackbar: Observer<void>,
    public snackbarExited: Observer<void>,

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
