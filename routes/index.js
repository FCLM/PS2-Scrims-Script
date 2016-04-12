var express = require('express');
var router = express.Router();
var io = require('socket.io');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'PlanetSide 2 Scrim Script' });
});

var scoreboard = {
  teamOne: {
    alias : '',
    outfit_id : '',
    nvame : '',
    faction : 0,
    points : 0,
    netScore : 0,
    kills : 0,
    deaths : 0,
    members : []
  },
  teamTwo: {
    alias : '',
    outfit_id : '',
    name : '',
    faction : 0,
    points : 0,
    netScore : 0,
    kills : 0,
    deaths : 0,
    members : []
  }
};

function teamToScoreboard(teamOne, teamTwo) {
  scoreboard = {
    teamOne: {
      alias : teamOne.alias,
      outfit_id : teamOne.outfit_id,
      name : teamOne.name,
      faction : teamOne.faction,
      points : teamOne.points,
      netScore : teamOne.netScore,
      kills : teamOne.kills,
      deaths : teamOne.deaths,
      members : teamOne.members
    },
    teamTwo: {
      alias : teamTwo.alias,
      outfit_id : teamTwo.outfit_id,
      name : teamTwo.name,
      faction : teamTwo.faction,
      points : teamTwo.points,
      netScore : teamTwo.netScore,
      kills : teamTwo.kills,
      deaths : teamTwo.deaths,
      members : teamTwo.members
    }
  };
  return scoreboard;
}

var killfeed = {
  killer : '',
  dead : '',
  weapon : '',
  image : '',
  timestamp: ''
};

module.exports = router;
exports.teamToScoreboard = teamToScoreboard;