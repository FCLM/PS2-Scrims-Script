var express = require('express');
var router = express.Router();
var io = require('socket.io');

/* GET users listing. */
router.get('/', function(req, res, next) {
 res.render('admin', { title: 'PS2 Scrim Script: Admin Controls' });
});

module.exports = router;
