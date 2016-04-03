/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key = require('./api_key.js');


var WebSocket = require('ws');
var ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key);

ws.on('open', function open() {
    var i;

    //team1 subscribing
    i = 0;
    teamOnePlayers.forEach(function() {
        ws.send('{"service":"event","action":"subscribe","characters":["' + teamOnePlayers[i] + '"],"eventNames":["Death"]}');
        i++;
    });

    //team1 subscribing
    i = 0;
    teamTwoPlayers.forEach(function() {
        ws.send('{"service":"event","action":"subscribe","characters":["' + teamTwoPlayers[] + '"],"eventNames":["Death"]}');
    });

    //facility Subscribing
    ws.send();

    //{"service":"event","action":"subscribe","characters":["5428010618035589553"],"eventNames":["Death"]}
    //
});

ws.on('message', function(data, flags) {
    // flags.binary will be set if a binary data is received.
    // flags.masked will be set if the data was masked.
    console.log(data);
});