'use strict';
import { Router, Route, hashHistory, IndexRoute} from 'react-router';//what's going on here?
import React from 'react';
import ReactDOM from 'react-dom';
import Canvas from './Canvas.js';

ReactDOM.render(
  (
    <Router history={hashHistory}>
      <Route path="/" component={Canvas} />
    </Router>
  ), document.getElementById('app')
);
