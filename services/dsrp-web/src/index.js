import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import App from "./App";
import "antd/dist/antd.less";
import "./styles/index.scss";
import fetchEnv from "./fetchEnv";
import configureStore from "./store/configureStore";
import { MatomoProvider, createInstance } from "@datapunt/matomo-tracker-react";

export const store = configureStore();

const instance = createInstance({
  urlBase: "https://matomo-eazios-test.pathfinder.gov.bc.ca/",
});

export class Index extends Component {
  constructor() {
    super();
    this.state = { environment: false };
    fetchEnv().then(() => {
      this.setState({ environment: true });
    });
  }

  render() {
    if (this.state.environment) {
      return (
        <Provider store={store}>
          <MatomoProvider value={instance}>
            <App />
          </MatomoProvider>
        </Provider>
      );
    }
    return <div />;
  }
}

render(<Index />, document.getElementById("root"));
