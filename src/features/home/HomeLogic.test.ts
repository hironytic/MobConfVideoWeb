//
// HomeLogic.test.ts
//
// Copyright (c) 2022 Hironori Ichimiya <hiron@hironytic.com>
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

import { Config } from "../../entities/Config";
import { HomeRepository } from "./HomeRepository";
import { NEVER, startWith, Subject, Subscription } from "rxjs";
import { AppHomeLogic, HomeLogic, HomeTab, HomeTabs } from "./HomeLogic";
import { EventuallyObserver } from "../../utils/EventuallyObserver";
import { delay } from "../../utils/Delay";

const config1 = {
  isInMaintenance: false
} as Config;

const config2 = {
  isInMaintenance: true
} as Config;

class MockHomeRepository implements HomeRepository {
  getConfig$ = jest.fn(() => NEVER.pipe(startWith(config1)));
}

let mockHomeRepository: MockHomeRepository;
let subscription: Subscription;
let logic: HomeLogic | undefined;

function createLogic(): HomeLogic {
  logic = new AppHomeLogic(mockHomeRepository);
  return logic;
}

beforeEach(() => {
  mockHomeRepository = new MockHomeRepository();
  subscription = new Subscription();
  logic = undefined;
});

afterEach(() => {
  subscription.unsubscribe();
  if (logic !== undefined) {
    logic.dispose();
  }
});

describe("isInMaintenance", () => {
  it("should emit value after configuration is retrieved", async () => {
    const subject = new Subject<Config>();
    mockHomeRepository.getConfig$.mockReturnValue(subject);
    
    const logic = createLogic();

    let isInMaintenance: boolean | undefined = undefined;
    const observer = {
      next(value: boolean) {
        isInMaintenance = value;
      }
    };
    subscription.add(logic.isInMaintenance$.subscribe(observer));
    await delay(500); // Wait a little
    expect(isInMaintenance).toBeUndefined();  // Not fulfilled yet
    
    subject.next(config1);
    expect(isInMaintenance).toBeDefined(); // Fulfilled
  });
  
  it("should emit false", async () => {
    mockHomeRepository.getConfig$.mockReturnValue(NEVER.pipe(startWith(config1)));
    
    const logic = createLogic();
    
    const observer = new EventuallyObserver<boolean>();
    const expectation = observer.expectValue(isInMaintenance => {
      expect(isInMaintenance).toBe(false);
    });
    subscription.add(logic.isInMaintenance$.subscribe(observer));
    await expectation;  // Should be fulfilled
  });

  it("should emit true", async () => {
    mockHomeRepository.getConfig$.mockReturnValue(NEVER.pipe(startWith(config2)));

    const logic = createLogic();

    const observer = new EventuallyObserver<boolean>();
    const expectation = observer.expectValue(isInMaintenance => {
      expect(isInMaintenance).toBe(true);
    });
    subscription.add(logic.isInMaintenance$.subscribe(observer));
    await expectation;  // Should be fulfilled
  });
});

describe("homeTab", () => {
  it("should emit request tab", async () => {
    const logic = createLogic();
    
    const observer = new EventuallyObserver<HomeTab>();
    const expectation = observer.expectValue(homeTab => {
      expect(homeTab).toBe(HomeTabs.Request);
    });
    subscription.add(logic.homeTab$.subscribe(observer));
    
    logic.setLocation({
      state: undefined,
      key: "default",
      pathname: "/request/mobconfvideo-1",
      search: "",
      hash: "",
    });
    await expectation;
  });

  it("should emit session tab", async () => {
    const logic = createLogic();

    const observer = new EventuallyObserver<HomeTab>();
    const expectation = observer.expectValue(homeTab => {
      expect(homeTab).toBe(HomeTabs.Session);
    });
    subscription.add(logic.homeTab$.subscribe(observer));

    logic.setLocation({
      state: undefined,
      key: "default",
      pathname: "/session",
      search: "",
      hash: "",
    });
    await expectation;
  });

  it("should emit no tab", async () => {
    const logic = createLogic();

    const observer = new EventuallyObserver<HomeTab>();
    const expectation = observer.expectValue(homeTab => {
      expect(homeTab).toBe(false);
    });
    subscription.add(logic.homeTab$.subscribe(observer));

    logic.setLocation({
      state: undefined,
      key: "default",
      pathname: "/notfound",
      search: "",
      hash: "",
    });
    await expectation;
  });
});

describe("title", () => {
  it("should emit title for request page", async () => {
    const logic = createLogic();

    const observer = new EventuallyObserver<string>();
    const expectation = observer.expectValue(title => {
      expect(title).toBe("リクエスト一覧");
    });
    subscription.add(logic.title$.subscribe(observer));

    logic.setLocation({
      state: undefined,
      key: "default",
      pathname: "/request",
      search: "",
      hash: "",
    });
    await expectation;
  });

  it("should emit title for session page", async () => {
    const logic = createLogic();

    const observer = new EventuallyObserver<string>();
    const expectation = observer.expectValue(title => {
      expect(title).toBe("動画を見つける");
    });
    subscription.add(logic.title$.subscribe(observer));

    logic.setLocation({
      state: undefined,
      key: "default",
      pathname: "/session",
      search: "",
      hash: "",
    });
    await expectation;
  });

  it("should emit empty", async () => {
    const logic = createLogic();

    const observer = new EventuallyObserver<string>();
    const expectation = observer.expectValue(title => {
      expect(title).toBe("");
    });
    subscription.add(logic.title$.subscribe(observer));

    logic.setLocation({
      state: undefined,
      key: "default",
      pathname: "/notfound",
      search: "",
      hash: "",
    });
    await expectation;
  });
});
