import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./Home";
import GameContainer from "./GameContainer";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/:room/:playerName" component={GameContainer} />
      </Switch>
    </Router>
  );
};

export default App;
