//
// DefaultNewRequestBloc.test.ts
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
import EventuallyObserver from '../../test/EventuallyObserver';
import MockRequestRepository from "../../test/mock/MockRequestRepository";
import ModalReflector from '../../test/ModalReflector';
import DefaultNewRequestBloc, { SNACKBAR_INFINITY, SNACKBAR_LONG } from './DefaultNewRequestBloc';
import { INewRequestBloc, ISnackbarSetting } from './NewRequestBloc';

let mockRequestRepository: MockRequestRepository;
let subscription: Subscription;
let bloc: INewRequestBloc;
let newRequestFromSessionDialog: ModalReflector<boolean>;
let requestKeyDialog: ModalReflector<boolean>;
let snackbar: ModalReflector<void>;

function createBloc() {
  bloc = DefaultNewRequestBloc.create(mockRequestRepository);
  subscription.add(newRequestFromSessionDialog.bindTo(bloc.newRequestFromSessionDialogBloc));
  subscription.add(requestKeyDialog.bindTo(bloc.requestKeyDialogBloc));
  subscription.add(snackbar.bindTo(bloc.snackbarBloc));
}

beforeEach(() => {
  mockRequestRepository = new MockRequestRepository();
  subscription = new Subscription();
  bloc = undefined!;
  newRequestFromSessionDialog = new ModalReflector();
  requestKeyDialog = new ModalReflector();
  snackbar = new ModalReflector();
});

afterEach(() => {
  subscription.unsubscribe();
  if (bloc) {
    bloc.dispose();
  }
});

it("shows request dialog", async () => {
  createBloc();

  const observer = new EventuallyObserver<boolean>();
  const expectation = observer.expectValue(visible => {
    expect(visible).toBeTruthy();
  });
  subscription.add(newRequestFromSessionDialog.visible.subscribe(observer));

  bloc.addRequestFromSession.next({
    sessionId: "s1",
  });

  await expectation;
});

it("doesn't request when user cancels the dialog", async () => {
  createBloc();

  const observer = new EventuallyObserver<boolean>();
  const expectation1 = observer.expectValue(visible => {
    expect(visible).toBeTruthy();
  });
  subscription.add(newRequestFromSessionDialog.visible.subscribe(observer));

  bloc.addRequestFromSession.next({
    sessionId: "s1",
  });
  await expectation1;

  const expectation2 = observer.expectValue(visible => {
    expect(visible).toBeFalsy();
  });
  
  bloc.newRequestFromSessionDialogBloc.onClose.next(false);
  await expectation2;

  expect(mockRequestRepository.addRequestFromSession).not.toHaveBeenCalled();
});

it("asks request-key at first request", async () => {
  createBloc();

  const newRequestFromSessionDialogObserver = new EventuallyObserver<boolean>();
  const expectation1 = newRequestFromSessionDialogObserver.expectValue(visible => {
    expect(visible).toBeTruthy();
  });
  subscription.add(newRequestFromSessionDialog.visible.subscribe(newRequestFromSessionDialogObserver));

  bloc.addRequestFromSession.next({
    sessionId: "s1",
  });
  await expectation1;

  const requestKeyDialogObserver = new EventuallyObserver<boolean>();  
  const expectation2 = requestKeyDialogObserver.expectValue(visible => {
    expect(visible).toBeTruthy();
  });
  subscription.add(requestKeyDialog.visible.subscribe(requestKeyDialogObserver));

  bloc.newRequestFromSessionDialogBloc.onClose.next(true);
  await expectation2;
});

async function waitForRequestKeyDialog(): Promise<void> {
  const newRequestFromSessionDialogObserver = new EventuallyObserver<boolean>();
  const expectation1 = newRequestFromSessionDialogObserver.expectValue(visible => {
    expect(visible).toBeTruthy();
  });
  subscription.add(newRequestFromSessionDialog.visible.subscribe(newRequestFromSessionDialogObserver));

  bloc.addRequestFromSession.next({
    sessionId: "s1",
  });
  await expectation1;

  const requestKeyDialogObserver = new EventuallyObserver<boolean>();  
  const expectation2 = requestKeyDialogObserver.expectValue(visible => {
    expect(visible).toBeTruthy();
  });
  subscription.add(requestKeyDialog.visible.subscribe(requestKeyDialogObserver));

  bloc.newRequestFromSessionDialogBloc.onClose.next(true);
  await expectation2;
}

it("changes the input value of request-key", async () => {
  createBloc();

  await waitForRequestKeyDialog();

  const valueObserver = new EventuallyObserver<string>();
  const expectation1 = valueObserver.expectValue(value => {
    expect(value).toBe("foo");
  })
  subscription.add(bloc.requestKeyDialogBloc.value.subscribe(valueObserver));
  bloc.requestKeyDialogBloc.onValueChanged.next("foo");
  await expectation1;

  const expectation2 = valueObserver.expectValue(value => {
    expect(value).toBe("foobar");
  });
  bloc.requestKeyDialogBloc.onValueChanged.next("foobar");
  await expectation2;
});

it("doesn't request when user cancels the request-key dialog", async () => {
  createBloc();

  await waitForRequestKeyDialog();

  bloc.requestKeyDialogBloc.onValueChanged.next("foobar");

  const observer = new EventuallyObserver<boolean>();
  const expectation = observer.expectValue(visible => {
    expect(visible).toBeFalsy();
  });
  subscription.add(requestKeyDialog.visible.subscribe(observer));
  bloc.requestKeyDialogBloc.onClose.next(false);
  await expectation;

  expect(mockRequestRepository.addRequestFromSession).not.toBeCalled();
});

it("sends request with specified request-key", async () => {
  mockRequestRepository.addRequestFromSession.mockReturnValue(Promise.resolve());
  createBloc();

  await waitForRequestKeyDialog();

  bloc.requestKeyDialogBloc.onValueChanged.next("foobar");

  const observer = new EventuallyObserver<boolean>();
  const expectation1 = observer.expectValue(visible => {
    expect(visible).toBeFalsy();
  });
  subscription.add(requestKeyDialog.visible.subscribe(observer));
  
  const snackbarObserver = new EventuallyObserver<boolean>();
  const expectation2 = snackbarObserver.expectValue(snackbarVisible => {
    expect(snackbarVisible).toBeTruthy();
  });
  subscription.add(snackbar.visible.subscribe(snackbarObserver));

  bloc.requestKeyDialogBloc.onClose.next(true);
  await Promise.all([expectation1, expectation2]);

  expect(mockRequestRepository.addRequestFromSession).toBeCalledWith({
    requestKey: "foobar",
    sessionId: "s1",
  });
});

it("shows a snackbar of 'sending'", async () => {
  mockRequestRepository.addRequestFromSession.mockReturnValue(Promise.resolve());
  createBloc();

  await waitForRequestKeyDialog();
  bloc.requestKeyDialogBloc.onValueChanged.next("foobar");

  const snackbarObserver = new EventuallyObserver<boolean>();
  const expectation1 = snackbarObserver.expectValue(snackbarVisible => {
    expect(snackbarVisible).toBeTruthy();
  });
  subscription.add(snackbar.visible.subscribe(snackbarObserver));
  const snackbarSettingObserver = new EventuallyObserver<ISnackbarSetting>();
  const expectation2 = snackbarSettingObserver.expectValue(setting => {
    expect(setting).toEqual({
      message: "通信中",
      autoHideDuration: SNACKBAR_INFINITY,
    });
  });
  subscription.add(bloc.snackbarBloc.setting.subscribe(snackbarSettingObserver));

  bloc.requestKeyDialogBloc.onClose.next(true);
  await Promise.all([expectation1, expectation2]);
});

async function waitForSending() {
  await waitForRequestKeyDialog();
  bloc.requestKeyDialogBloc.onValueChanged.next("foobar");

  const snackbarObserver = new EventuallyObserver<boolean>();
  const expectation1 = snackbarObserver.expectValue(snackbarVisible => {
    expect(snackbarVisible).toBeTruthy();
  });
  subscription.add(snackbar.visible.subscribe(snackbarObserver));
  const snackbarSettingObserver = new EventuallyObserver<ISnackbarSetting>();
  const expectation2 = snackbarSettingObserver.expectValue(setting => {
    expect(setting).toEqual({
      message: "通信中",
      autoHideDuration: SNACKBAR_INFINITY,
    });
  });
  subscription.add(bloc.snackbarBloc.setting.subscribe(snackbarSettingObserver));

  bloc.requestKeyDialogBloc.onClose.next(true);
  await Promise.all([expectation1, expectation2]);
}

it("shows a snackbar of 'sent'", async () => {
  let mockResolve = () => { return };
  mockRequestRepository.addRequestFromSession.mockReturnValue(new Promise<void>(resolve => {
    mockResolve = resolve;
  }));
  createBloc();

  await waitForSending();

  const snackbarSettingObserver = new EventuallyObserver<ISnackbarSetting>();
  const expectation = snackbarSettingObserver.expectValue(setting => {
    expect(setting).toEqual({
      message: "リクエストを送信しました。",
      autoHideDuration: SNACKBAR_LONG,
    });
  });
  subscription.add(bloc.snackbarBloc.setting.subscribe(snackbarSettingObserver));

  mockResolve();
  await expectation;
});

it("shows request-key dialog when request-key doesn't match", async () => {
  let mockReject =  (_: any) => { return };
  mockRequestRepository.addRequestFromSession.mockReturnValue(new Promise<void>((_, reject) => {
    mockReject = reject;
  }));

  createBloc();

  await waitForSending();

  const requestKeyDialogObserver = new EventuallyObserver<boolean>();  
  const expectation = requestKeyDialogObserver.expectValue(visible => {
    expect(visible).toBeTruthy();
  });
  subscription.add(requestKeyDialog.visible.subscribe(requestKeyDialogObserver));

  mockReject({
    code: "failed-precondition",
    details: "invalid_request_key",
  });
  await expectation;
});

it("shows a snackbar of 'error'", async () => {
  let mockReject =  (_: any) => { return };
  mockRequestRepository.addRequestFromSession.mockReturnValue(new Promise<void>((_, reject) => {
    mockReject = reject;
  }));

  createBloc();

  await waitForSending();

  const snackbarSettingObserver = new EventuallyObserver<ISnackbarSetting>();
  const expectation = snackbarSettingObserver.expectValue(setting => {
    expect(setting).toEqual({
      message: "エラー: リクエストを送信できませんでした。",
      autoHideDuration: SNACKBAR_LONG,
    });
  });
  subscription.add(bloc.snackbarBloc.setting.subscribe(snackbarSettingObserver));

  mockReject({
    code: "not-found",
    details: "invalid_session",
  });
  await expectation;
});

it("doesn't ask request-key if it is already known", async () => {
  let mockResolve = () => { return };
  mockRequestRepository.addRequestFromSession.mockReturnValueOnce(new Promise<void>(resolve => {
    mockResolve = resolve;
  }));
  createBloc();

  // first request
  await waitForSending();

  const snackbarSettingObserver = new EventuallyObserver<ISnackbarSetting>();
  const expectation1 = snackbarSettingObserver.expectValue(setting => {
    expect(setting).toEqual({
      message: "リクエストを送信しました。",
      autoHideDuration: SNACKBAR_LONG,
    });
  });
  subscription.add(bloc.snackbarBloc.setting.subscribe(snackbarSettingObserver));

  mockResolve();
  await expectation1;

  // second request
  const newRequestFromSessionDialogObserver = new EventuallyObserver<boolean>();
  const expectation2 = newRequestFromSessionDialogObserver.expectValue(visible => {
    expect(visible).toBeTruthy();
  });
  subscription.add(newRequestFromSessionDialog.visible.subscribe(newRequestFromSessionDialogObserver));
  bloc.addRequestFromSession.next({
    sessionId: "s2",
  });
  await expectation2;

  const expectation3 = snackbarSettingObserver.expectValue(setting => {
    expect(setting).toEqual({
      message: "通信中",
      autoHideDuration: SNACKBAR_INFINITY,
    });
  });
  bloc.newRequestFromSessionDialogBloc.onClose.next(true);
  await expectation3;

  expect(mockRequestRepository.addRequestFromSession).toHaveBeenLastCalledWith({
    requestKey: "foobar",
    sessionId: "s2",
  });
});
