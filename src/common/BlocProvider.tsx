//
// BlocProvider.tsx
//
// Copyright (c) 2018-2021 Hironori Ichimiya <hiron@hironytic.com>
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

import React, { Key } from 'react';
import { IBloc } from './Bloc';

type BlocCreator<T extends IBloc> = () => T;

interface IProps<T extends IBloc> {
  key?: Key;
  context: React.Context<T>;
  creator: BlocCreator<T>;
}

interface IState<T extends IBloc> {
  bloc?: T;
}

class BlocProvider<T extends IBloc> extends React.Component<IProps<T>, IState<T>> {
  private bloc?: T;

  public constructor(props: Readonly<IProps<T>> | IProps<T>) {
    super(props);
    this.state = {
      bloc: undefined,
    };
  }

  public componentDidMount() {
    this.bloc = this.state.bloc;
  }

  public componentWillUnmount() {
    if (this.bloc !== undefined) {
      this.bloc.dispose();
      this.bloc = undefined;
    }
  }

  public static getDerivedStateFromProps<T extends IBloc>(props: IProps<T>, state: IState<T>): IState<T> {
    return {
      bloc: props.creator(),
    };
  }

  public componentDidUpdate(prevProps: IProps<T>, prevState: IState<T>) {
    if (this.state.bloc !== this.bloc) {
      this.bloc?.dispose();
      this.bloc = this.state.bloc
    }
  }

  public render() {
    if (this.state.bloc !== undefined) {
      const Provider = this.props.context.Provider;
      return (
        <Provider value={this.state.bloc}>
          {this.props.children}
        </Provider>
      )
    } else {
      return (<React.Fragment/>);
    }
  }
}

export default BlocProvider;
