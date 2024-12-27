import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import deploymentVersion from "./Services/deploymentVersion.json";
import * as serviceWorker from './serviceWorker';
import androidApiCalls from "./Services/androidApiCallsService";
import ScreenSizeService from "../src/Services/screenSizeService";
import localeListService from './Services/localeListService';
import PropTypes from "prop-types";
import ErrorBoundary from './ContextProviders/ErrorBoundary';

const MobileTheme = React.lazy(() => import('./Themes/mobileTheme'));
const BrowserTheme = React.lazy(() => import('./Themes/browserTheme'));

const ThemeSelector = ({ children }) => {
  const CHOSEN_THEME = androidApiCalls.checkBrowserType();
  androidApiCalls.setDAVersion(deploymentVersion.version)
  return (
    <>
      <React.Suspense fallback={<></>}>
        {(CHOSEN_THEME === 'browser') && <BrowserTheme />}
        {(CHOSEN_THEME === 'engage') && <MobileTheme />}
      </React.Suspense>
      {children}
    </>
  )
}

localeListService.getElementActionLocale("res/AllLocales/", "strings.xml").then(value => {
  localeListService.setActionLocaleObj(value);
  ReactDOM.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeSelector>
          <App />
        </ThemeSelector>
      </ErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root')
  );
})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
ScreenSizeService.setFullScreenHeight('html, body', 1);

ThemeSelector.propTypes = {
  children: PropTypes.node.isRequired,
};