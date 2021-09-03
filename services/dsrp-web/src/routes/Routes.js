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
    <Route exact path={routes.REQUEST_ACCESS.route} component={routes.REQUEST_ACCESS.component} />
    <Route
      exact
      path={routes.VIEW_APPLICATION_STATUS_LINK.route}
      component={routes.VIEW_APPLICATION_STATUS.component}
    />
    <Route
      exact
      path={routes.APPLICATION_SUCCESS.route}
      component={routes.APPLICATION_SUCCESS.component}
    />

    {/* PRIVATE ROUTES */}
    <Route
      exact
      path={routes.REVIEW_APPLICATIONS.route}
      component={AuthenticationGuard()(routes.REVIEW_APPLICATIONS.component)}
    />
    <Route
      exact
      path={routes.REVIEW_APPROVED_CONTRACTED_WORK.route}
      component={AuthenticationGuard()(routes.REVIEW_APPROVED_CONTRACTED_WORK.component)}
    />
    <Route
      exact
      path={routes.COMPANY_PAYMENT_INFO.route}
      component={AuthenticationGuard()(routes.COMPANY_PAYMENT_INFO.component)}
    />
    <Route
      exact
      path={routes.VIEW_APPLICATION.route}
      component={AuthenticationGuard()(routes.VIEW_APPLICATION.component)}
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
