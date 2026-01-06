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
import "./unit/game/game.test";
import "./unit/game/utils.tests";
import "./unit/models/utils.tests";
import "./unit/game/useGame.test";
import "./unit/models/useGame.test";
import "./unit/models/spectrum.tests";

console.log("All tests loaded");
