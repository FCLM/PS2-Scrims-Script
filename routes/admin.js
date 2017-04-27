const express = require('express');
const router = express.Router();
const io = require('socket.io');
const items = require('../items.js');
const ps2ws = require('../ps2ws.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    const pointMap = ps2ws.getPointMaps();
    const catMap = items.getCategoryMaps();

    res.render('admin', {
        catMap: catMap.name,
        pointMap: pointMap.name
    });
});

module.exports = router;
