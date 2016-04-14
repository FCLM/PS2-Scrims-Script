/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key   = require('./api_key.js'),
    teams     = require('./teams.js'),
    items     = require('./items.js'),
    WebSocket = require('ws'),
    app       = require('./app'),
    config    = require('./config'),
    fs        = require('fs');

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

function initialiseOverlay() {
  fs.writeFile('scoreT1.txt', '0', function(err) {
    if (err) {
      return console.log('scoreT1.txt Error: ' + err);
    }
    console.log('scoreT1.txt updated: ' + '0')
  });
  fs.writeFile('scoreT2.txt', '0', function(err) {
    if (err) {
      return console.log('scoreT1.txt Error: ' + err);
    }
    console.log('scoreT2.txt updated: ' + '0')
  });
  fs.writeFile('playersT1.txt', '', function(err) {
    if (err) {
      return console.log('playersT1.txt Error: ' + err);
    }
    console.log('playersT1.txt updated: ' + '')
  });
  fs.writeFile('playersT2.txt', '', function(err) {
    if (err) {
      return console.log('playersT2.txt Error: ' + err);
    }
    console.log('playersT2.txt updated: ' + '')
  });
}

function scoreUpdate() {
  //for use in OBS for the overlay
  //writes to 2 text files the current team score
  fs.writeFile('scoreT1.txt', teamOneObject.points, function (err) {
    if (err) {
      return console.log('scoreT1.txt Error: ' + err);
    }
    console.log('scoreT1.txt updated: ' + teamOneObject.points)
  });

  fs.writeFile('scoreT2.txt', teamTwoObject.points, function (err) {
    if (err) {
      return console.log('scoreT2.txt Error: ' + err);
    }
    console.log('scoreT2.txt updated: ' + teamTwoObject.points)
  });
  //Writes player data to a text file
  var teamOneActivePlayers = [];
  for (keys in teamOneObject.members) {
    teamOneActivePlayers.push(teamOneObject.members[keys])
  }
  var teamOneActive = '';
  var i = 0;
  teamOneActivePlayers.forEach(function (member) {
    if ((member.points > 0) || (member.netScore != 0)) {
      teamOneActive += member.name + '\t ' + member.points;
      if (i % 2 == 0) {
        teamOneActive += '    |    ';
        i++
      } else {
        teamOneActive += '\n';
        i++;
      }
    }
  });
  fs.writeFile('playersT1.txt', teamOneActive, function (err) {
    if (err) {
      return console.log('playersT1.txt Error: ' + err);
    }
    console.log('playersT1.txt updated: ' + '')
  });

  var teamTwoActivePlayers = [];
  for (keys in teamTwoObject.members) {
    teamTwoActivePlayers.push(teamTwoObject.members[keys])
  }
  var teamTwoActive = '';
  var i = 0;
  teamTwoActivePlayers.forEach(function (member) {
    if ((member.points > 0) || (member.netScore != 0)) {
      teamTwoActive += member.name + '\t ' + member.points;
      if (i % 2 == 0) {
        teamTwoActive += '    |    ';
        i++
      } else {
        teamTwoActive += '\n';
        i++;
      }
    }
  });
  fs.writeFile('playersT2.txt', teamTwoActive, function (err) {
    if (err) {
      return console.log('playersT2.txt Error: ' + err);
    }
    console.log('playersT2.txt updated: ' + teamTwoActive);
  });
}


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
    oneIvITwo(data, points, item);
  } else if ((teamTwoObject.members.hasOwnProperty(data.attacker_character_id)) && (teamOneObject.members.hasOwnProperty(data.character_id))) {
    twoIvIOne(data, points, item);
  } else if ((data.attacker_character_id == data.character_id) && (teamOneObject.members.hasOwnProperty(data.character_id))){
    // Suicides team One lol
    if ((data.character_laodout_id == 7) || (data.character_laodout_id == 14) || (data.character_laodout_id == 21)) {
      //suicided as a max lol
      points = 5;
    } else {
      //just infantry suicide
      points = 2;
    }
    teamOneSuicide(data, points, item);
  } else if ((data.attacker_character_id == data.character_id) && (teamTwoObject.members.hasOwnProperty(data.character_id))){
    // Suicides team Two lol
    if ((data.character_laodout_id == 7) || (data.character_laodout_id == 14) || (data.character_laodout_id == 21)) {
      //suicided as a max lol
      points = 5;
    } else {
      //just infantry suicide
      points = 2;
    }
    teamTwoSuicide(data, points, item);
  } else if ((teamOneObject.members.hasOwnProperty(data.attacker_character_id)) && (teamOneObject.members.hasOwnProperty(data.character_id))) {
      // Hahahaha he killed his mate
   teamOneTeamkill(data, item);
  } else if ((teamTwoObject.members.hasOwnProperty(data.attacker_character_id)) && (teamTwoObject.members.hasOwnProperty(data.character_id))) {
    // Hahahaha he killed his mate
    teamTwoTeamkill(data, item);
  }
  app.sendScores(teamOneObject, teamTwoObject);
  scoreUpdate();
}

function oneIvITwo (data, points, item) {
  teamOneObject.points += points;
  teamOneObject.netScore += points;
  teamTwoObject.netScore -= points;
  teamOneObject.kills++;
  teamTwoObject.deaths++;
  teamOneObject.members[data.attacker_character_id].points += points;
  teamOneObject.members[data.attacker_character_id].netScore += points;
  teamTwoObject.members[data.character_id].netScore -= points;
  teamOneObject.members[data.attacker_character_id].kills++;
  teamTwoObject.members[data.character_id].deaths++;
  //logging
  console.log(teamOneObject.members[data.attacker_character_id].name + ' -->  ' + teamTwoObject.members[data.character_id].name + ' for ' + points + ' points (' + item.name + ')');
  console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  //create a JSON and send it to the web
  var obj = {
    winner: teamOneObject.members[data.attacker_character_id].name,
    winner_faction: teamOneObject.faction,
    loser: teamTwoObject.members[data.character_id].name,
    loser_faction: teamTwoObject.faction,
    weapon: item.name,
    image: item.image,
    points: points,
    time: 0
  };
  app.killfeedEmit(obj);
}

function twoIvIOne (data, points, item) {
  teamTwoObject.points += points;
  teamTwoObject.netScore += points;
  teamOneObject.netScore -= points;
  teamTwoObject.kills++;
  teamOneObject.deaths++;
  teamTwoObject.members[data.attacker_character_id].points += points;
  teamTwoObject.members[data.attacker_character_id].netScore += points;
  teamOneObject.members[data.character_id].netScore -= points;
  teamTwoObject.members[data.attacker_character_id].kills++;
  teamOneObject.members[data.character_id].deaths++;
  //logging
  console.log(teamTwoObject.members[data.attacker_character_id].name + ' --> ' + teamOneObject.members[data.character_id].name + ' for ' + points + ' points (' + item.name + ')');
  console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  //create a JSON and send it to the web
  var obj = {
    winner: teamTwoObject.members[data.attacker_character_id].name,
    winner_faction: teamTwoObject.faction,
    loser: teamOneObject.members[data.character_id].name,
    loser_faction: teamOneObject.faction,
    weapon: item.name,
    image: item.image,
    points: points,
    time: 0
  };
  app.killfeedEmit(obj);
}

function teamOneSuicide (data, points, item) {
  teamOneObject.points -= points;
  teamOneObject.netScore -= points;
  teamOneObject.deaths++;
  teamOneObject.members[data.attacker_character_id].points -= points;
  teamOneObject.members[data.attacker_character_id].deaths++;
  //logging
  console.log(teamOneObject.members[data.attacker_character_id].name + ' Killed himself -' + points);
  console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  //create a JSON and send it to the web
  var obj = {
    winner: teamOneObject.members[data.attacker_character_id].name,
    winner_faction: teamOneObject.faction,
    loser: teamOneObject.members[data.character_id].name,
    loser_faction: teamOneObject.faction,
    weapon: item.name,
    image: item.image,
    points: 0 - points,
    time: 0
  };
  app.killfeedEmit(obj);
}

function teamTwoSuicide (data, points, item) {
  teamTwoObject.points -= points;
  teamTwoObject.netScore -= points;
  teamTwoObject.deaths++;
  teamTwoObject.members[data.attacker_character_id].points -= points;
  teamTwoObject.members[data.attacker_character_id].deaths++;
  //logging
  console.log(teamTwoObject.members[data.attacker_character_id].name + ' Killed himself -' + points);
  console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  //create a JSON and send it to the web
  var obj = {
    winner: teamTwoObject.members[data.attacker_character_id].name,
    winner_faction: teamTwoObject.faction,
    loser: teamTwoObject.members[data.character_id].name,
    loser_faction: teamTwoObject.faction,
    weapon: item.name,
    image: item.image,
    points: 0 - points,
    time: 0
  };
  app.killfeedEmit(obj);
}

function teamOneTeamkill (data, item) {
  points = 5;
  teamOneObject.points -= points;
  teamOneObject.netScore -= points;
  teamOneObject.deaths++;
  teamOneObject.members[data.attacker_character_id].points -= points;
  teamOneObject.members[data.character_id].deaths++;
  //logging
  console.log(teamOneObject.members[data.attacker_character_id].name + ' teamkilled ' + teamOneObject.members[data._character_id].name + ' -' + points);
  console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  //create a JSON and send it to the web
  var obj = {
    winner: teamTwoObject.members[data.attacker_character_id].name,
    winner_faction: teamTwoObject.faction,
    loser: teamTwoObject.members[data.character_id].name,
    loser_faction: teamTwoObject.faction,
    weapon: item.name,
    image: item.image,
    points: 0 - points,
    time: 0
  };
  app.killfeedEmit(obj);
}

function teamTwoTeamkill (data, item) {
  points = 5;
  teamTwoObject.points -= points;
  teamTwoObject.netScore -= points;
  teamTwoObject.deaths++;
  teamTwoObject.members[data.attacker_character_id].points -= points;
  teamTwoObject.members[data.character_id].deaths++;
  //logging
  console.log(teamTwoObject.members[data.attacker_character_id].name + ' teamkilled ' + teamTwoObject.members[data._character_id].name + ' -' + points);
  console.log(teamOneObject.points + ' ' + teamTwoObject.points);
  //create a JSON and send it to the web
  var obj = {
    winner: teamTwoObject.members[data.attacker_character_id].name,
    winner_faction: teamTwoObject.faction,
    loser: teamTwoObject.members[data.character_id].name,
    loser_faction: teamTwoObject.faction,
    weapon: item.name,
    image: item.image,
    points: 0 - points,
    time: 0
  };
  app.killfeedEmit(obj);
}

function itsFacilityData(data) {
  //deals with adding points to the correct team
  if (data.outfit_id == teamOneObject.outfit_id) {
    var points;
    if (captures == 0) {
      points = 10;
      teamOneObject.points += points;
      teamOneObject.netScore += points;
      teamTwoObject.netScore -= points;
      console.log(teamOneObject.name + ' captured the base +' + points);
      console.log(teamOneObject.points + ' ' + teamTwoObject.points);
    } else {
      points = 25;
      teamOneObject.points += points;
      teamOneObject.netScore += points;
      teamTwoObject.netScore -= points;
      console.log(teamOneObject.name + ' captured the base +' + points);
      console.log(teamOneObject.points + ' ' + teamTwoObject.points);
    }
  } else if (data.outfit_id == teamTwoObject.outfit_id) {
    if (captures == 0) {
      points = 10;
      teamTwoObject.points += points;
      teamTwoObject.netScore += points;
      teamOneObject.netScore -= points;
      console.log(teamTwoObject.name + ' captured the base +' + points);
      console.log(teamOneObject.points + ' ' + teamTwoObject.points);
    } else {
      points = 25;
      teamTwoObject.points += points;
      teamTwoObject.netScore += points;
      teamOneObject.netScore -= points;
      console.log(teamTwoObject.name + ' captured the base +' + points);
      console.log(teamOneObject.points + ' ' + teamTwoObject.points);
    }
  }
  captures++;
  //else it was captured by neither outfit and they deserve no points
}

function createStream() {
  var ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);
  ws.on('open', function open() {
    //team1 subscribing
    //{"service":"event","action":"subscribe","characters":["5428010618035589553"],"eventNames":["Death"]}
    teamOne.members.forEach(function (member) {
      ws.send('{"service":"event","action":"subscribe","characters":["' + member.character_id + '"],"eventNames":["Death"]}');
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
    initialiseOverlay();
  ws.on('message', function (data) {
    if (data.indexOf("payload") == 2) {
      //if (data.indexOf('"event_name":"FacilityControl"') == -1 || data.indexOf('"facility_id":"' + config.config.base + '"') > -1) {
        dealWithTheData(data);
      //}
    }
    //store the data somewhere - possibly a txt file in case something gets disputed
  });
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
        app.refreshPage();
      } else {
        createStream();
        app.refreshPage();
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
  initialiseOverlay();
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
