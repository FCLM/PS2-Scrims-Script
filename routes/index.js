const express = require('express');
const router = express.Router();
const io = require('socket.io');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'PlanetSide 2 Scrim Script' });
});

module.exports = router;