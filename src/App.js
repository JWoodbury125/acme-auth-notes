import React from "react";
import axios from "axios";
import { connect } from "react-redux";
import { attemptLogin, logout, getNotes } from "./store";
import { Route, Switch, Redirect } from "react-router-dom";
import Home from "./Home";
import Notes from "./Notes";
import SignIn from "./SignIn";

class App extends React.Component {
  componentDidMount() {
    this.props.attemptLogin();
  }
  componentDidUpdate(prevProps) {
    if (!prevProps.auth.id && this.props.auth.id) {
      console.log("HERE ARE THE PREVPROPS-->", prevProps);
      console.log("HERE ARE THE THIS.PROPS-->", this.props);
    }
  }
  render() {
    const { auth } = this.props;
    console.log(auth);

    if (!auth.id) {
      return (
        <Switch>
          <Route path="/signin" component={SignIn} />
          <Route path="/" component={SignIn} />
        </Switch>
      );
    } else {
      return (
        <Switch>
          <Route path="/home" component={Home} />
          <Route path="/notes" component={Notes} />
          <Redirect to="/home" />
        </Switch>
      );
    }
  }
}

const mapState = (state) => state;
const mapDispatch = (dispatch) => {
  return {
    attemptLogin: () => {
      return dispatch(attemptLogin());
    },
    getNotes: (id) => {
      dispatch(getNotes(id));
    },
  };
};

export default connect(mapState, mapDispatch)(App);
