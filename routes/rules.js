var express = require('express');
var router = express.Router();
var io = require('socket.io');
var items = require('../items.js');
var ps2ws = require('../ps2ws.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var catMaps = items.getCategoryMaps();
    var currentCatMapName = catMaps.current.name;
    var currentCatMap = catMaps.current;
    delete currentCatMap.name;

    var pointMaps = ps2ws.getPointMaps();
    var currentPointMapName = pointMaps.current.name;
    var currentPointMap = pointMaps.current;
    delete currentPointMap.name;

    res.render('rules', {
        title: 'PS2 Scrim Script: Admin Controls',
        catMapName: currentCatMapName,
        catMap: currentCatMap,
        pointMapName: currentPointMapName,
        pointMap: currentPointMap
    });
});

module.exports = router;
