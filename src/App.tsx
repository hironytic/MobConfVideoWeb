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
import BlocProvider from 'src/common/BlocProvider';
import './App.css';
import IRepositories from './IRepositories';
import DefaultConferenceRepository from './repository/DefaultConferenceRepository';
import DefaultEventRepository from './repository/DefaultEventRepository';
import DefaultRequestRepository from './repository/DefaultRequestRepository';
import DefaultSessionRepository from './repository/DefaultSessionRepository';
import RepositoryContext from './RepositoryContext';
import Home from './view/home/Home';
import DefaultRequestBloc from './view/request/DefaultRequestBloc';
import RequestContext from './view/request/RequestContext';
import DefaultVideoBloc from './view/video/DefaultVideoBloc';
import VideoContext from './view/video/VideoContext';

class App extends React.Component {
  private eventRepository = new DefaultEventRepository();
  private requestRepository = new DefaultRequestRepository();
  private conferenceRepository = new DefaultConferenceRepository();
  private sessionRepository = new DefaultSessionRepository();

  public render() {
    const repositories: IRepositories = {
      eventRepository: this.eventRepository,
      requestRepository: this.requestRepository,
      conferenceRepository: this.conferenceRepository,
      sessionRepository: this.sessionRepository,
    };
    const requestBlocCreator = () => DefaultRequestBloc.create(
      repositories.eventRepository,
      repositories.requestRepository,
    );
    const videoBlocCreator = () => DefaultVideoBloc.create(
      repositories.conferenceRepository,
      repositories.sessionRepository,
    );
    return (
      <RepositoryContext.Provider value={repositories}>
        <BlocProvider context={RequestContext} creator={requestBlocCreator}>
          <BlocProvider context={VideoContext} creator={videoBlocCreator}>
            <div className="App">
              <Home/>
            </div>
          </BlocProvider>
        </BlocProvider>
      </RepositoryContext.Provider>
    );
  }
}

export default App;
