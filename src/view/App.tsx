//
// App.tsx
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

import { Button } from '@material-ui/core';
import * as React from 'react';
import BlocProvider from 'src/common/BlocProvider';
import './App.css';
import MCVAppBar from './MCVAppBar';
import DefaultRequestBloc from './request/DefaultRequestBloc';
import RequestContext from './request/RequestContext';
import RequestPage from './request/RequestPage';

interface IState {
  pageIndex: number,
}

class App extends React.Component<{}, IState> {
  public state = {
    pageIndex: 0,
  }

  public render() {
    const requestBlocCreator = () => DefaultRequestBloc.create();
    return (
      <BlocProvider context={RequestContext} creator={requestBlocCreator}>
        <div className="App">
          <MCVAppBar  title={this.getPageTitle()}
                      pageIndex={this.state.pageIndex}
                      onPageIndexChange={this.handlePageIndexChange} />
          { this.renderPage() }
        </div>
      </BlocProvider>
    );
  }

  private getPageTitle(): string {
    switch (this.state.pageIndex) {
      case 0:
        return "リクエスト";

      case 1:
        return "動画を見つける";

      default:
        return "";
    }
  }

  private renderPage() {
    switch (this.state.pageIndex) {
      case 0:
        return (
          <RequestPage />
        );

      case 1:
        return (
          <div>
            <p className="App-intro">
              To get started, edit <code>src/App.tsx</code> and save to reload.
            </p>
            <Button variant="contained" color="primary">
              Hello World
            </Button>
          </div>
        );

      default:
          return (<div />);
    }
  }

  private handlePageIndexChange = (event: React.ChangeEvent<{}>, value: any) => {
    this.setState({
      pageIndex: value,
    });
  }
}

export default App;
