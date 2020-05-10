import React from "react";
import { Link, Route, Switch } from "react-router-dom";
import { Result, Button, Icon, Typography } from "antd";
import AuthenticationGuard from "@/hoc/AuthenticationGuard";
import * as routes from "@/constants/routes";

const { Text } = Typography;

const Routes = () => (
  <Switch>
    {/* PUBLIC ROUTES */}
    <Route exact path={routes.HOME.route} component={routes.HOME.component} />
    <Route exact path={routes.RETURN_PAGE.route} component={routes.RETURN_PAGE.component} />

    <Route
      exact
      path={routes.SUBMIT_APPLICATION.route}
      component={routes.SUBMIT_APPLICATION.component}
    />
    <Route
      exact
      path={routes.VIEW_APPLICATION_STATUS.route}
      component={routes.VIEW_APPLICATION_STATUS.component}
    />

    {/* PRIVATE ROUTES */}
    <Route
      exact
      path={routes.REVIEW_APPLICATIONS.route}
      component={AuthenticationGuard()(routes.REVIEW_APPLICATIONS.component)}
    />

    {/* 404 - PAGE NOT FOUND */}
    <Route
      render={() => (
        <Result
          title="Page Not Found"
          status="warning"
          subTitle={<Text>Sorry, the page you requested does not exist.</Text>}
          icon={<Icon type="exclamation-circle" />}
          extra={
            <Link to={routes.HOME.route}>
              <Button>Home</Button>
            </Link>
          }
        />
      )}
    />
  </Switch>
);

export default Routes;
