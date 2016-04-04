/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key = require('./api_key.js'),
    teams   = require('./teams.js'),
    items   = require('./items.js');

var WebSocket = require('ws');
function createStream(teamOne, teamTwo, facilityID) {
    var ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);

    ws.on('open', function open() {
        //team1 subscribing
        //{"service":"event","action":"subscribe","characters":["5428010618035589553"],"eventNames":["Death"]}
        teamOne.members.forEach(function () {
            ws.send('{"service":"event","action":"subscribe","characters":["' + teamOne.members.character_id +'"],"eventNames":["Death"]}');
        });

        //team2 subscribing

        teamTwo.members.forEach(function () {
            ws.send('{"service":"event","action":"subscribe","characters":["' + teamOne.members.character_id + '"],"eventNames":["Death"]}');
        });

        //facility Subscribing
        ws.send('{"service":"event","action":"subscribe","characters":["' + facilityID + '"],"eventNames":["FacilityControl"]}');
        //not correct currently

        //
    });

    ws.on('message', function (data, flags) {
        // flags.binary will be set if a binary data is received.
        // flags.masked will be set if the data was masked.
        console.log(data);

    });

}

function startup() {
  items.initialise().then(function(result) {
    if (result) {
      console.log('Items are initialised');
      // start websocket now ?

      // test an item
      var item_test = items.lookupItem(131254);
      console.log(item_test._id + ' - ' + item_test.name);
    } else {
      console.error('Items did not initialise!!');
    }
  });
}

startup();