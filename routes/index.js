var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'PlanetSide 2 Scrim Script' });
});

var scoreboard = {
  teamOne: {
    alias : '',
    outfit_id : '',
    name : '',
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

var killfeed = {
  killer : '',
  dead : '',
  weapon : '',
  image : '',
  timestamp: ''
};

module.exports = router;
