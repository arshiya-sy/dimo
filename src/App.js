import React from 'react';
import './App.css';
import {
  Router,
  Switch,
  Route
} from "react-router-dom";
import routes from './routeConfig'
import { AuthProvider } from "./ContextProviders/AuthProvider";
import AppRoute from "./appRoute";
import { CSSTransition, TransitionGroup} from 'react-transition-group';

import history from "./history.js";
function App() {
  return (
    <AuthProvider>
      <Router history={history}>
      <Route render={({ location }) => (
      <TransitionGroup
        childFactory={child =>
        React.cloneElement(child, {
          classNames:location.transition === 'right' ? "pageSliderRight" : (location.transition === "none" ? "noTransition" : "pageSliderLeft"),
          timeout: location.transition === "none" ? 0 : 300
        })
      }>
              <CSSTransition
                key={location.key}
                className={location.transition === 'right' ? "pageSliderRight" : (location.transition === "none" ? "noTransition" : "pageSliderLeft") }
                timeout= {location.transition === "none" ? 0 : 300}
                mountOnEnter={true}
                unmountOnExit={true}
              >
          <Switch location={location}>
            {routes.map((route, index) => (
              <AppRoute
                key={index}
                path={route.path}
                component={route.component}
                isPrivate={route.isPrivate}
              />
            ))}
          </Switch>
          </CSSTransition>
        </TransitionGroup>
        )} />
      </Router>
    </AuthProvider>
  );
}

export default App;
