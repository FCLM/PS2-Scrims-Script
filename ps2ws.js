/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key = require('./api_key.js'),
    teams   = require('./teams.js'),
    items   = require('./items.js'),
    WebSocket = require('ws');

var config = require('./config');


var teamOne, teamOneObject, teamTwoObject, teamTwo, facilityID;
var captures = 0;

var time = Date.now();

var memberTemplate = JSON.stringify({
  name : '',
  points : 0,
  netScore : 0,
  kills : 0,
  deaths : 0
});

function teamObject(team) {
  // Create a new indexable team object
  var outfit_obj = {
    alias : team.alias,
    outfit_id : team.outfit_id,
    name : team.name,
    faction : team.faction,
    points : 0,
    netScore : 0,
    kills : 0,
    deaths : 0,
    members : {}
  };
  team.members.forEach(function(member) {
    var obj = JSON.parse(memberTemplate);
    obj.name = member.name;
    if (!outfit_obj.hasOwnProperty(member.character_id)) {
      outfit_obj.members[member.character_id] = obj;
    }
  });
  return outfit_obj;
}

function dealWithTheData(raw) {
  raw = raw.replace(': :', ':');
  var data = JSON.parse(raw).payload;
  if (data.event_name == "Death") {
    itsPlayerData(data);
  } else if (data.name == "Death") {
    //debugging match only
    itsPlayerData(data);
  } else {
    itsFacilityData(data);
  }
}

//probably remove once canabilised
/*function findPoints(data) {
  var attackerLoadout = data.attacker_laodout_id;
  var defenderLoadout = data.character_laodout_id;
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
    return items.lookupPointsfromCategory(weaponID);
  }
}*/

function itsPlayerData(data) {
  //deals with adding points to the correct player & team
  var item = items.lookupItem(data.attacker_weapon_id);
  var points = items.lookupPointsfromCategory(item.category_id);
  if ((data.attacker_laodout_id == 7) || (data.attacker_laodout_id == 14) || (data.attacker_laodout_id == 21)) {
    //Attacker using a max
    if ((data.character_laodout_id == 7) || (data.character_laodout_id == 14) || (data.character_laodout_id == 21)) {
      //Attacker used a max to kill a max
      points = 3;
    } else {
      //max v infantry
      points = 1;
    }
  } else if ((data.character_laodout_id == 7) || (data.character_laodout_id == 14) || (data.character_laodout_id == 21)) {
    //defender used a max
    points = 5;
  }
  if ((teamOneObject.members.hasOwnProperty(data.attacker_character_id)) && (teamTwoObject.members.hasOwnProperty(data.character_id))) {
    // Standard IvI
    //add points/lower net score for correct teams
    teamOneObject.points += points;
    teamTwoObject.netScore -= points;
    //add kill/death to correct teams
    teamOneObject.kills++;
    teamTwoObject.deaths++;
    //add points/lower net score for correct players
    teamOneObject.members[data.attacker_character_id].points += points;
    teamTwoObject.members[data.character_id].netScore -= points;
    //add kill/death to correct players
    teamOneObject.members[data.attacker_character_id].kills++;
    teamTwoObject.members[data.character_id].deaths++;
    console.log(teamOneObject.members[data.attacker_character_id].name + ' -->  ' + teamTwoObject.members[data.character_id].name + ' for ' + points + ' points (' + item.name + ')');
    console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  } else if ((teamTwoObject.members.hasOwnProperty(data.attacker_character_id)) && (teamOneObject.members.hasOwnProperty(data.character_id))) {
    // Standard IvI
    //add points/lower net score for correct teams
    teamTwoObject.points += points;
    teamOneObject.netScore -= points;
    //add kill/death to correct teams
    teamTwoObject.kills++;
    teamOneObject.deaths++;
    //add points/lower net score for correct players
    teamTwoObject.members[data.attacker_character_id].points += points;
    teamOneObject.members[data.character_id].netScore -= points;
    //add kill/death to correct players
    teamTwoObject.members[data.attacker_character_id].kills++;
    teamOneObject.members[data.character_id].deaths++;
    console.log(teamTwoObject.members[data.attacker_character_id].name + ' --> ' + teamOneObject.members[data.character_id].name + ' for ' + points + ' points (' + item.name + ')');
    console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  } else if ((data.attacker_character_id == data.character_id) && (teamOneObject.members.hasOwnProperty(data.character_id))){
    // Suicides team One lol
    if ((data.character_laodout_id == 7) || (data.character_laodout_id == 14) || (data.character_laodout_id == 21)) {
      //suicided as a max lol
      points = 5;
    } else {
      //just infantry suicide
      points = 2;
    }
    teamOneObject.points -= points;
    teamOneObject.deaths++;
    teamOneObject.members[data.attacker_character_id].points -= points;
    teamOneObject.members[data.attacker_character_id].deaths++;
    console.log(teamOneObject.members[data.attacker_character_id].name + ' Killed himself -' + points);
    console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  } else if ((data.attacker_character_id == data.character_id) && (teamTwoObject.members.hasOwnProperty(data.character_id))){
    // Suicides team Two lol
    if ((data.character_laodout_id == 7) || (data.character_laodout_id == 14) || (data.character_laodout_id == 21)) {
      //suicided as a max lol
      points = 5;
    } else {
      //just infantry suicide
      points = 2;
    }
    teamTwoObject.points -= points;
    teamTwoObject.deaths++;
    teamTwoObject.members[data.attacker_character_id].points -= points;
    teamTwoObject.members[data.attacker_character_id].deaths++;
    console.log(teamTwoObject.members[data.attacker_character_id].name + ' Killed himself -' + points);
    console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  } else if ((teamOneObject.members.hasOwnProperty(data.attacker_character_id)) && (teamOneObject.members.hasOwnProperty(data.character_id))) {
      // Hahahaha he killed his mate
    points = 5;
    teamOneObject.points -= points;
    teamOneObject.deaths++;
    teamOneObject.members[data.attacker_character_id].points -= points;
    teamOneObject.members[data.character_id].deaths++;
    console.log(teamOneObject.members[data.attacker_character_id].name + ' teamkilled ' + teamOneObject.members[data._character_id].name + ' -' + points);
    console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  }else if ((teamTwoObject.members.hasOwnProperty(data.attacker_character_id)) && (teamTwoObject.members.hasOwnProperty(data.character_id))) {
    // Hahahaha he killed his mate
    points = 5;
    teamTwoObject.points -= points;
    teamTwoObject.deaths++;
    teamTwoObject.members[data.attacker_character_id].points -= points;
    teamTwoObject.members[data.character_id].deaths++;
    console.log(teamTwoObject.members[data.attacker_character_id].name + ' teamkilled ' + teamTwoObject.members[data._character_id].name + ' -' + points);
    console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  }
}

function itsFacilityData(data) {
  //deals with adding points to the correct team

  if (data.outfit_id == teamOneObject.outfit_id) {
    var points;
    if (captures == 0) {
      points += 10;
    } else {
      points += 25;
    }
    teamOneObject.points += points;
    console.log(TeamOneObject.name + ' captured the base +' + points);
    console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  } else if (data.outfit_id == teamTwoObject.outfit_id) {
    if (captures == 0) {
      points += 10;
    } else {
      points += 25;
    }
    teamTwoObject.points += points;
    console.log(TeamTwoObject.name + ' captured the base +' + points);
    console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  }
  captures++;
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
        dealWithTheData(data);
      }
    }
    //store the data somewhere - possibly a txt file in case something gets disputed
  });

}

function actUponData(data) {
  //console.log((Date.now() - time) + ' ' + data);
}

function startUp(tOne, tTwo, fID) {
  items.initialise().then(function(result) {
    if (result) {
      //console.log('Items are initialised');
      time = Date.now();
      console.log(time + ' start match');
      console.log('=====================================================================================================================================');
      // start websocket now ?
      teamOne = tOne;
      teamOneObject = teamObject(teamOne);
      teamTwo = tTwo;
      teamTwoObject= teamObject(teamTwo);
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
