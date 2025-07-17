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
  const [isGameOver, setIsGameOver] = useState(false);

  const handleGameOver = () => {
    console.log("💥 GAME OVER");
    setIsGameOver(true);
  };

  const { player, setPlayer, resetPlayer } = usePlayer();
  const { grid, pile } = useGame(
    player,
    resetPlayer,
    handleGameOver,
    isGameOver
  );

  useControls({ player, setPlayer, pile, isGameOver });

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/:room/:playerName" component={GameContainer} />
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
