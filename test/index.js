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
import "./unit/game/spectrumutils.test";

console.log("All tests loaded");
