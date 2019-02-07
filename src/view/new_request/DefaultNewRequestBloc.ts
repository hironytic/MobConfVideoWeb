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

import { BehaviorSubject, Observer } from 'rxjs';
import asObserver from 'src/common/AsObserver';
import ModalLogic from 'src/common/ModalLogic';
import { sleep } from 'src/common/Sleep';
import { IRequestRepository } from 'src/repository/RequestRepository';
import { IAddRequestFromSessionParams, INewRequestBloc, INewRequestFromSessionDialogBloc, IRequestKeyDialogBloc, ISnackbarBloc, ISnackbarSetting } from "./NewRequestBloc";

export const SNACKBAR_SHORT = 1500;
export const SNACKBAR_LONG = 2750;
export const SNACKBAR_INFINITY = undefined;

class DefaultNewRequestBloc implements INewRequestBloc {
  public static create(
    requestRepository: IRequestRepository,
  ): DefaultNewRequestBloc {
    let storedRequestKey: string | undefined;

    const newRequestFromSessionDialogLogic = new ModalLogic<boolean>();

    const requestKeyDialogValue = new BehaviorSubject<string>("");
    const requestKeyDialogLogic = new ModalLogic<boolean>(() => {
      requestKeyDialogValue.next("");
    });

    const snackbarSetting = new BehaviorSubject<ISnackbarSetting>({message: "", autoHideDuration: undefined});
    const snackbarLogic = new ModalLogic((setting: ISnackbarSetting) => {
      snackbarSetting.next(setting);
    }, () => { return });

    async function onAddRequestFromSession(params: IAddRequestFromSessionParams) {
      if (await newRequestFromSessionDialogLogic.show() !== true) {
        return;
      }

      let tryAgain = false;
      let tryCount = 0;
      do {
        tryAgain = false;
        if (storedRequestKey === undefined) {
          const done = await requestKeyDialogLogic.show();
          if (!done) {
            return;
          }
          storedRequestKey = requestKeyDialogValue.value;
        }

        snackbarLogic.show({message: "通信中", autoHideDuration: SNACKBAR_INFINITY});

        if (storedRequestKey === "") {
          storedRequestKey = undefined;
          tryAgain = true;
        } else {
          try {
            await requestRepository.addRequestFromSession({
              requestKey: storedRequestKey,
              sessionId: params.sessionId,
            });
            snackbarLogic.show({message: "リクエストを送信しました。", autoHideDuration: SNACKBAR_LONG});
          } catch (error) {
            if (error.details === "invalid_request_key") {
              storedRequestKey = undefined;
              tryAgain = true;
            } else {
              snackbarLogic.show({message: "エラー: リクエストを送信できませんでした。", autoHideDuration: SNACKBAR_LONG});
            }
          }
        }
        tryCount++;
        if (tryCount >= 3) {
          // forbid user to try another request code repeatedly
          await sleep(5000);
          tryCount = 0;
        }
        if (tryAgain) {
          snackbarLogic.show({message: "リクエストキーを再入力してください。", autoHideDuration: SNACKBAR_SHORT});
        }
      } while(tryAgain);
    }

    return new DefaultNewRequestBloc(
      // inputs
      asObserver(onAddRequestFromSession),

      // outputs

      // sub-bloc
      {
        ...newRequestFromSessionDialogLogic.inputs,
        ...newRequestFromSessionDialogLogic.outputs,
      },
      {
        ...requestKeyDialogLogic.inputs,
        ...requestKeyDialogLogic.outputs,
        onValueChanged: requestKeyDialogValue,
        value: requestKeyDialogValue,
      },
      {
        ...snackbarLogic.inputs,
        ...snackbarLogic.outputs,
        setting: snackbarSetting,
      }
    );
  }

  private constructor(
    // inputs
    public addRequestFromSession: Observer<IAddRequestFromSessionParams>,

    // outputs

    // sub-bloc
    public newRequestFromSessionDialogBloc: INewRequestFromSessionDialogBloc,
    public requestKeyDialogBloc: IRequestKeyDialogBloc,
    public snackbarBloc: ISnackbarBloc,    
  ) { }

  public dispose() {
    return;
  }

}

export default DefaultNewRequestBloc;
