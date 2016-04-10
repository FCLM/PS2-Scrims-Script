/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key = require('./api_key.js'),
    teams   = require('./teams.js'),
    items   = require('./items.js'),
    WebSocket = require('ws');

var config = require('./config');

var teamOneScore = 0, teamTwoScore = 0;
var teamOne, teamTwo, facilityID;

var time = Date.now();

function dealWithTheData(raw) {
  raw = raw.replace(': :', ':');
  var data = JSON.parse(raw).payload;
  if (data.name == "Death") {
    //itsPlayerData(data);
    var item = items.lookupItem(data.attacker_weapon_id);
    var points = items.lookupPointsfromCategory(item.category_id);
    console.log(data.attacker_character_id + ' killed ' + data.character_id + ' for ' + points + ' points (' + item.name + ')');
  } else {
    //itsFacilityData(data);
  }
}

function findPoints(data) {
  var attackerLoadout = data.payload.attacker_laodout_id;
  var defenderLoadout = data.payload.character_laodout_id;
  // Is attacker a Max?
  if ((attackerLoadout == 7) || (attackerLoadout == 14) || (attackerLoadout == 21)) {
    return 1;
  }
  // Is defender a Max?
  else if ((defenderLoadout == 7) || (defenderLoadout == 14) || (defenderLoadout == 21)) {
    return 5;
  }
  // Must be IvI
  else {
    var weaponID = items.lookupItem(data.payload.attacker_weapon_id);
    var points = items.lookupPointsfromCategory(weaponID);
    return points;
  }
}

function itsPlayerData(data) {
  //deals with adding points to the correct player & team
  var points = findPoints(data);
  teamOne.members.forEach(function (data) {
    if (data.payload.attacker_character_id == teamOne.members.character_id) {

    }
  });
  teamTwo.members.forEach(function (data) {
    if (data.payload.attacker_character_id == teamTwo.members.character_id) {

    }
  });

}

function itsFacilityData(data) {
  //deals with adding points to the correct team
  if (data.payload.outfit_id == teamOne.outfit_id) {
    teamOneScore += 10;
  } else if (data.payload.outfit_id == teamTwo.outfit_id) {
    teamTwoScore += 10;
  }
  //else it was captured by neither outfit and they deserve no points
  //currently doesn't deal with recaps :/
}

function createStream() {
  var ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);
  ws.on('open', function open() {
    //team1 subscribing
    //{"service":"event","action":"subscribe","characters":["5428010618035589553"],"eventNames":["Death"]}
    teamOne.members.forEach(function (member) {
      ws.send('{"service":"event","action":"subscribe","characters":["' + member.character_id +'"],"eventNames":["Death"]}');
      //console.log('Sent: {"service":"event","action":"subscribe","characters":["' + member.character_id +'"],"eventNames":["Death"]}')
    });
    //team2 subscribing
    teamTwo.members.forEach(function (member) {
      ws.send('{"service":"event","action":"subscribe","characters":["' + member.character_id + '"],"eventNames":["Death"]}');
      //console.log('Sent: {"service":"event","action":"subscribe","characters":["' + member.character_id + '"],"eventNames":["Death"]}');
    });
    //facility Subscribing
    ws.send('{"service":"event","action":"subscribe","worlds":["19","25"],"eventNames":["FacilityControl"]}');
    //not correct currently - subscribes to all, i guess it could just be that and then if the facility is the right one then add points to corresponding team
  });

  ws.on('message', function (data, flags) {
    // flags.binary will be set if a binary data is received.
    // flags.masked will be set if the data was masked.
    if (data.indexOf("payload") == 2) {
      if (data.indexOf('"event_name":"FacilityControl"') == -1 || data.indexOf('"facility_id":"' + config.config.base + '"') > -1) {
        actUponData(data)
      }
    }
    /*if (data.type == "serviceMessage") {
     dealWithTheData(data);
     }*/
    //store the data somewhere - possibly a txt file in case something gets disputed
  });

}

function actUponData(data) {
  console.log((Date.now() - time) + ' ' + data);
}

function startUp(tOne, tTwo, fID) {
  items.initialise().then(function(result) {
    if (result) {
      //console.log('Items are initialised');
      time = Date.now();
      console.log(time + ' start match');
      console.log('=======================================================');
      // start websocket now ?
      teamOne = tOne;
      teamTwo = tTwo;
      facilityID = fID;
      if (config.DEBUG) {
        debugWebSocket();
      } else {
        createStream();
      }
      // test an item
      //var item_test = items.lookupItem(7214);
      //console.log(item_test._id + ' - ' + item_test.name);
    } else {
      console.error('Items did not initialise!!');
    }
  });
}

function debugWebSocket() {
  var round = config.debug.round;
  var counter = 15000;
  var i = setInterval(function(){
    if (round.hasOwnProperty('' + counter)) {
      dealWithTheData(config.debug.round['' + counter]);
    }
    counter++;
    if(counter === 600000) {
      clearInterval(i);
    }
  }, 1);
}

exports.startUp = startUp;