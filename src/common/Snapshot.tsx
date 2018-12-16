//
// Snapshot.tsx
//
// Copyright (c) 2018 Hironori Ichimiya <hiron@hironytic.com>
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

import React, { Key, ReactNode } from 'react';
import { Observable, Subscription } from 'rxjs';

interface IProps<T> {
  key?: Key,
  source: Observable<T>;
  initialValue: T;
}

interface IState<T> {
  value: T;
}

type Builder<T> = (value: T) => ReactNode;

class Snapshot<T> extends React.Component<IProps<T>, IState<T>> {
  public state = {
    value: this.props.initialValue,
  }

  private subscription?: Subscription;

  public componentDidMount() {
    this.subscription = this.props.source.subscribe((value) => {
      this.setState({value});
    });
  }

  public componentWillReceiveProps() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.props.source.subscribe((value) => {
      this.setState({value});
    });
  }

  public componentWillUnmount() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  public render() {
    return this.getBuilder()(this.state.value);
  }

  private getBuilder(): Builder<T> {
    return (Array.isArray(this.props.children) ? this.props.children[0] : this.props.children) as Builder<T>;
  }
}

export default Snapshot;
