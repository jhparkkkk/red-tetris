import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Home from "./Home";
import GameContainer from "./GameContainer";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route
          path="/:room/:playerName"
          render={(props) => {
            if (props.location.state && props.location.state.fromButton) {
              return <GameContainer {...props} />;
            } else {
              return <Redirect to="/" />;
            }
          }}
        />
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
