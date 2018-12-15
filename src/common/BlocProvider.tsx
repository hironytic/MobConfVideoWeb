//
// BlocProvider.tsx
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

import React from 'react';

type BlocCreator<T extends IBloc> = () => T;

interface IProps<T extends IBloc> {
  context: React.Context<T>;
  creator: BlocCreator<T>;
}


class BlocProvider<T extends IBloc> extends React.Component<IProps<T>> {
  private bloc?: T;

  public componentWillMount() {
    this.bloc = this.props.creator();
  }

  public componentWillUnmount() {
    if (this.bloc !== undefined) {
      this.bloc.dispose();
      this.bloc = undefined;
    }
  }

  public componentWillReceiveProps() {
    if (this.bloc !== undefined) {
      this.bloc.dispose();
    }
    this.bloc = this.props.creator();
    this.setState({});
  }

  public render() {
    const Provider = this.props.context.Provider;
    return (
      <Provider value={this.bloc!}>
        {this.props.children}
      </Provider>
    )
  }
}

export default BlocProvider;
