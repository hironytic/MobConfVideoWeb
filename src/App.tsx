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

import * as React from 'react';
import './App.css';
import Snapshot from './common/Snapshot';
import IRepositories from './IRepositories';
import Config from './model/Config';
import DefaultConferenceRepository from './repository/DefaultConferenceRepository';
import DefaultConfigRepository from './repository/DefaultConfigRepository';
import DefaultEventRepository from './repository/DefaultEventRepository';
import DefaultRequestRepository from './repository/DefaultRequestRepository';
import DefaultSessionRepository from './repository/DefaultSessionRepository';
import RepositoryContext from './RepositoryContext';
import Home from './view/home/Home';
import Maintenance from './view/home/Maintenance';
import DefaultRequestBlocProvider from './view/request/DefaultRequestBlocProvider';
import DefaultVideoBlocProvider from './view/video/DefaultVideoBlocProvider';

class App extends React.Component {
  private configRepository = new DefaultConfigRepository();
  private eventRepository = new DefaultEventRepository();
  private requestRepository = new DefaultRequestRepository();
  private conferenceRepository = new DefaultConferenceRepository();
  private sessionRepository = new DefaultSessionRepository();

  public render() {
    const repositories: IRepositories = {
      configRepository: this.configRepository,
      eventRepository: this.eventRepository,
      requestRepository: this.requestRepository,
      conferenceRepository: this.conferenceRepository,
      sessionRepository: this.sessionRepository,
    };
    return (
      <RepositoryContext.Provider value={repositories}>
        {this.renderAppBody()}
      </RepositoryContext.Provider>
    );
  }

  private renderAppBody() {
    return (
      <div className="App">
        <RepositoryContext.Consumer>
          {repos => (
            <Snapshot source={repos.configRepository.getConfigObservable()}>
              {(config: Config) => {
                if (config === undefined) {
                  return (<React.Fragment/>);
                } else if (config.inMaintenance) {
                  return (<Maintenance/>);
                } else {
                  return this.renderHome();
                }
              }}
            </Snapshot>
          )}
        </RepositoryContext.Consumer>
      </div>
    );
  }

  private renderHome() {
    return (
      <DefaultRequestBlocProvider>
        <DefaultVideoBlocProvider>
          <Home/>
        </DefaultVideoBlocProvider>
      </DefaultRequestBlocProvider>
    );
  }
}

export default App;
