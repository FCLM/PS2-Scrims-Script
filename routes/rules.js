var express = require('express');
var router = express.Router();
var io = require('socket.io');
var items = require('../items.js');
var ps2ws = require('../ps2ws.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var catMap = items.getCategoryMaps();
    var catMapName = catMap.name;
    var pointMap = ps2ws.getPointMaps();
    var pointMapName = pointMap.name;
    res.render('rules', {
        title: 'PS2 Scrim Script: Admin Controls',
        catMapName: catMapName,
        catMap: catMap,
        pointMapName: pointMapName,
        pointMap: pointMap
    });
});

module.exports = router;
