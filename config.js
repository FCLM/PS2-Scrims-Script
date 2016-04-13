
var debug_match = require('./test_matches/fclm_match_10042016');

var DEBUG = false;

var config = {
  base:  244610, // rime 244610, heyoka 206002
  team1: 'MLCF',
  team2: 'FLCM'
};

var debug = {
  base: debug_match.base,
  team1: debug_match.team1,
  team2: debug_match.team2,
  round: debug_match.round0
};

module.exports.DEBUG = DEBUG;
module.exports.config = config;
module.exports.debug = debug;
