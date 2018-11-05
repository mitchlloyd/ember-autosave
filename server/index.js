// To use it create some files under `mocks/`
// e.g. `server/mocks/ember-hamsters.js`
//
// module.exports = function(app) {
//   app.get('/ember-hamsters', function(req, res) {
//     res.send('hello');
//   });
// };

module.exports = function(app) {
  let globSync   = require('glob').sync;
  let mocks      = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require);
  let proxies    = globSync('./proxies/**/*.js', { cwd: __dirname }).map(require);
  let bodyParser = require('body-parser');

  // Log proxy requests
  let morgan  = require('morgan');
  app.use(morgan('dev'));
  app.use(bodyParser.json());

  mocks.forEach(function(route) { route(app); });
  proxies.forEach(function(route) { route(app); });

};
