//
// RequestPage.tsx
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

import { CircularProgress, Tab, Tabs, Theme, withTheme } from '@material-ui/core';
import React, { Key } from 'react';
import { combineLatest } from 'rxjs';
import Snapshot from 'src/common/Snapshot';
import Event from 'src/model/Event';
import RequestContext from './RequestContext';
import RequestTab from './RequestTab';

interface IProps {
  key?: Key,
  theme: Theme,
}

class RequestPage extends React.Component<IProps> {
  public render() {
    return (
      <div>
        <RequestContext.Consumer>
          {(bloc) => {
            const source = combineLatest(bloc.allEvents, bloc.currentEventIndex)
            const tabIndexChange = (_: React.ChangeEvent<{}>, value: number) => bloc.currentEventIndexChanged.next(value);
            return (
              <Snapshot source={source} initialValue={[[], 0]}>
                {([events, tabIndex]: [Event[], number]) => {
                  if (events.length === 0) {
                    return (
                      <CircularProgress size={25} style={{margin: this.props.theme.spacing.unit * 2}}/>
                    );
                  }
                  return (
                    <Tabs value={tabIndex}
                          onChange={tabIndexChange}
                          scrollable={true}>
                      {events.map(this.renderEventTab)}
                    </Tabs>
                  );
                }}
              </Snapshot>
            );
          }}
        </RequestContext.Consumer>
        <RequestTab />
      </div>
    );
  }

  private renderEventTab(event: Event) {
    return (
      <Tab key={event.id} label={event.name} />
    );
  }
}

export default withTheme()(RequestPage);
