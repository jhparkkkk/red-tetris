//require("./setup");

import glob from "glob";

// console.log(__dirname)
// const files = glob.sync("src/server#<{(||)}>#*.js")
// files.forEach(file => {
//   console.log(file)
//   require('../' + file)
// })
import "./fake";
import "./redux1";
import "./server1";

// Import des nouveaux tests
import "./unit/game/utils.test";
import "./unit/game/spectrumUtils.test";
import "./unit/game/spectrum.test";
import "./unit/game/home.test";
import "./unit/game/scoreBoard.test";
import "./unit/game/nextPiece.test";
import "./unit/game/gameBoardThemeToggle.test";
import "./unit/game/useGame.test";
import "./unit/server/serverGame.test";
import "./unit/server/serverIndex.test";
import "./unit/hook/useGameHook.test";
import "./unit/hook/useNextPiece.test";
import "./unit/hook/usePlayer.test";
import "./unit/hook/useTheme.test";
import "./unit/hook/useControls.test";
import "./unit/hook/useScore.test";
//import "./unit/hook/useControlsKeyboard.test";
import "./integration/server.test";
//import "./unit/hook/useControlsHook.test";
console.log("All tests loaded");
