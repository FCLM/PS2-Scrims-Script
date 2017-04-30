/**
 * Created by dylancross on 27/04/17.
 */
const express = require('express');
const router = express.Router();
const io = require('socket.io');
const outfit = require('../outfit.js');

router.get('/', function(req, res, next) {
    let currentAlias = outfit.getAlias();
    let alias = [];
    for (let keys in currentAlias) {
        let obj = {
            character_id: keys,
            actual: currentAlias[keys].actual,
            alias : currentAlias[keys].name
        };
        alias.push(obj);
    }
    res.render('alias', { alias: alias });
});

module.exports = router;