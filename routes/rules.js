const express = require('express');
const router = express.Router();
const io = require('socket.io');
const items = require('../items.js');
const ps2ws = require('../ps2ws.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    const catMap = items.getCategoryMaps();
    const catMapName = catMap.name;
    const pointMap = ps2ws.getPointMaps();
    const pointMapName = pointMap.name;
    res.render('rules', {
        title: 'PS2 Scrim Script: Admin Controls',
        catMapName: catMapName,
        catMap: catMap,
        pointMapName: pointMapName,
        pointMap: pointMap
    });
});

module.exports = router;
