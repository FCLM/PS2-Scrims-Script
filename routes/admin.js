var express = require('express');
var router = express.Router();
var io = require('socket.io');
var items = require('../items.js');
var ps2ws = require('../ps2ws.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('admin', { title: 'PS2 Scrim Script: Admin Controls' });
});

module.exports = router;
