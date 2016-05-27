/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key   = require('./api_key.js'),
    teams     = require('./teams.js'),
    items     = require('./items.js'),
    WebSocket = require('ws'),
    app       = require('./app'),
    config    = require('./config'),
    fs        = require('fs'),
    io        = require('socket.io');

var teamOne,
    teamOneObject,
    teamTwoObject,
    teamTwo,
    captures = 0,
    roundTracker = 0,
    time = Date.now(),
    pOne = '',
    pTwo = '',
    pThree = '',
    timeCounter = 0;

var memberTemplate = JSON.stringify({
  name : '',
  points : 0,
  netScore : 0,
  kills : 0,
  deaths : 0
});
 /*
  Overlay Code
  Writes to 5 files to allow a streamer to use them in OBS to display the match stats
  */
function initialiseOverlay() {
  fs.writeFile('overlay/scoreT1.txt', '0', function(err) {
    if (err) {
      return console.log('scoreT1.txt Error: ' + err);
    }
    console.log('scoreT1.txt initialised')
  });
  fs.writeFile('overlay/scoreT2.txt', '0', function(err) {
    if (err) {
      return console.log('scoreT1.txt Error: ' + err);
    }
    console.log('scoreT2.txt initialised')
  });
  fs.writeFile('overlay/playersT1.txt', '', function(err) {
    if (err) {
      return console.log('playersT1.txt Error: ' + err);
    }
    console.log('playersT1.txt initialised')
  });
  fs.writeFile('overlay/playersT2.txt', '', function(err) {
    if (err) {
      return console.log('playersT2.txt Error: ' + err);
    }
    console.log('playersT2.txt initialised')
  });
  fs.writeFile('overlay/time.txt', '', function(err) {
    if (err) {
      return console.log('time.txt Error: ' + err);
    }
    console.log('time.txt initialised')
  });
  fs.writeFile('overlay/killfeed.txt', '', function(err) {
    if (err) {
      return console.log('killfeed.txt Error: ' + err);
    }
    console.log('killfeed.txt intialised')
  })
}

function scoreUpdate() {
  //for use in OBS for the overlay
  //writes to 2 text files the current team score
  fs.writeFile('overlay/scoreT1.txt', teamOneObject.points, function (err) {
    if (err) {
      return console.log('scoreT1.txt Error: ' + err);
    }
  });

  fs.writeFile('overlay/scoreT2.txt', teamTwoObject.points, function (err) {
    if (err) {
      return console.log('scoreT2.txt Error: ' + err);
    }
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
      var memName = member.name;
      var netScore = member.netScore.toString();
      while (memName.length < 16) {
        memName += ' ';
      }
      while (netScore.length < 4) {
        netScore = ' ' + netScore;
      }
      teamOneActive += memName + '  ' + netScore;
      if (i % 2 == 0) {
        teamOneActive += ' | ';
        i++
      } else {
        teamOneActive += '\n';
        i++;
      }
    }
  });
  fs.writeFile('overlay/playersT1.txt', teamOneActive, function (err) {
    if (err) {
      return console.log('playersT1.txt Error: ' + err);
    }
  });
  var teamTwoActivePlayers = [];
  for (keys in teamTwoObject.members) {
    teamTwoActivePlayers.push(teamTwoObject.members[keys])
  }
  var teamTwoActive = '';
  i = 0;
  teamTwoActivePlayers.forEach(function (member) {
    if ((member.points > 0) || (member.netScore != 0)) {
      var memName = member.name;
      var netScore = member.netScore.toString();
      while (memName.length < 16) {
        memName += ' ';
      }
      while (netScore.length < 4) {
        netScore = ' ' + netScore;
      }
      teamTwoActive += memName + '  ' + netScore;
      if (i % 2 == 0) {
        teamTwoActive += ' | ';
        i++
      } else {
        teamTwoActive += '\n';
        i++;
      }
    }
  });
  fs.writeFile('overlay/playersT2.txt', teamTwoActive, function (err) {
    if (err) {
      return console.log('playersT2.txt Error: ' + err);
    }
  });
}

function killfeedUpdate(killObj) {
  pThree = pTwo;
  pTwo = pOne;
  var killer = killObj.winner;
  while (killer.length < 16) {
    killer += ' ';
  }
  var weapon = '[' + killObj.weapon + ']';
  while (weapon.length < 16) {
      weapon += ' ';
  }
  var  killed = killObj.loser;
  while (killed.length < 16) {
    killed += ' ';
  }
  pOne = killer + ' ' + weapon + '  ' + killed + '\n';
  var feed = pOne + pTwo + pThree;
  fs.writeFile('overlay/killfeed.txt', feed, function(err) {
    if (err) {
      return console.log('killfeed.txt Error: ' + err);
    }
  })
}

function killfeedBaseUpdate(tag, points) {
  pThree = pTwo;
  pTwo = pOne;
  pOne = '       ['+ tag + '] Captured the base (+' + points + ')';
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
    if (config.DEBUG) {
      var obj = JSON.parse(memberTemplate);
      obj.name = teams.removeNameParts(member.name);
      if (!outfit_obj.hasOwnProperty(member.character_id)) {
        outfit_obj.members[member.character_id] = obj;
      }
    } else {
      obj = JSON.parse(memberTemplate);
      obj.name = member.name;
      if (!outfit_obj.hasOwnProperty(member.character_id)) {
        outfit_obj.members[member.character_id] = obj;
      }
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
  if ((data.attacker_loadout_id == 7) || (data.attacker_loadout_id == 14) || (data.attacker_loadout_id == 21)) {
    //Attacker using a max
    if ((data.character_loadout_id == 7) || (data.character_loadout_id == 14) || (data.character_loadout_id == 21)) {
      //Attacker used a max to kill a max
      points = 3;
    } else {
      //max v infantry
      points = 1;
    }
  } else if ((data.character_loadout_id == 7) || (data.character_loadout_id == 14) || (data.character_loadout_id == 21)) {
    //defender used a max
    points = 5;
  }
  if ((teamOneObject.members.hasOwnProperty(data.attacker_character_id)) && (teamTwoObject.members.hasOwnProperty(data.character_id))) {
    oneIvITwo(data, points, item);
  } else if ((teamTwoObject.members.hasOwnProperty(data.attacker_character_id)) && (teamOneObject.members.hasOwnProperty(data.character_id))) {
    twoIvIOne(data, points, item);
  } else if ((data.attacker_character_id == data.character_id) && (teamOneObject.members.hasOwnProperty(data.character_id))){
    // Suicides team One lol
    if ((data.character_loadout_id == 7) || (data.character_loadout_id == 14) || (data.character_loadout_id == 21)) {
      //suicided as a max lol
      console.log('MAX: \n' + data);
      points = 5;
    } else {
      //just infantry suicide
      console.log(data);
      points = 2;
    }
    teamOneSuicide(data, points, item);
  } else if ((data.attacker_character_id == data.character_id) && (teamTwoObject.members.hasOwnProperty(data.character_id))){
    // Suicides team Two lol
    if ((data.character_loadout_id == 7) || (data.character_loadout_id == 14) || (data.character_loadout_id == 21)) {
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
  killfeedUpdate(obj);
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
  killfeedUpdate(obj);
}

function teamOneSuicide (data, points, item) {
  teamOneObject.points -= points;
  teamOneObject.netScore -= points;
  teamOneObject.deaths++;
  teamOneObject.members[data.attacker_character_id].points -= points;
  teamOneObject.members[data.attacker_character_id].netScore -= points;
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
  killfeedUpdate(obj);
}

function teamTwoSuicide (data, points, item) {
  teamTwoObject.points -= points;
  teamTwoObject.netScore -= points;
  teamTwoObject.deaths++;
  teamTwoObject.members[data.attacker_character_id].points -= points;
  teamTwoObject.members[data.attacker_character_id].netScore -= points;
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
  killfeedUpdate(obj);
}

function teamOneTeamkill (data, item) {
  var points = 5;
  teamOneObject.points -= points;
  teamOneObject.netScore -= points;
  teamOneObject.deaths++;
  teamOneObject.members[data.attacker_character_id].points -= points;
  teamOneObject.members[data.character_id].deaths++;
  //logging
  console.log(teamOneObject.members[data.attacker_character_id].name + ' teamkilled ' + teamOneObject.members[data.character_id].name + ' -' + points);
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
  killfeedUpdate(obj);
}

function teamTwoTeamkill (data, item) {
  var points = 5;
  teamTwoObject.points -= points;
  teamTwoObject.netScore -= points;
  teamTwoObject.deaths++;
  teamTwoObject.members[data.attacker_character_id].points -= points;
  teamTwoObject.members[data.character_id].deaths++;
  //logging
  console.log(teamTwoObject.members[data.attacker_character_id].name + ' teamkilled ' + teamTwoObject.members[data.character_id].name + ' -' + points);
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
  killfeedUpdate(obj);
}

function itsFacilityData(data) {
  //deals with adding points to the correct team
  if (data.new_faction_id != data.old_faction_id) {
    if (data.outfit_id == teamOneObject.outfit_id) {
      var points;
      if (captures == 0) {
        points = 10;
        teamOneObject.points += points;
        teamOneObject.netScore += points;
        teamTwoObject.netScore -= points;
        console.log(teamOneObject.name + ' captured the base +' + points);
        console.log(teamOneObject.points + ' ' + teamTwoObject.points);
        app.sendScores(teamOneObject, teamTwoObject);
        killfeedBaseUpdate(teamOneObject.alias, points);
      } else {
        points = 25;
        teamOneObject.points += points;
        teamOneObject.netScore += points;
        teamTwoObject.netScore -= points;
        console.log(teamOneObject.name + ' captured the base +' + points);
        console.log(teamOneObject.points + ' ' + teamTwoObject.points);
        app.sendScores(teamOneObject, teamTwoObject);
        killfeedBaseUpdate(teamOneObject.alias, points);
      }
      captures++;
    } else if (data.outfit_id == teamTwoObject.outfit_id) {
      if (captures == 0) {
        points = 10;
        teamTwoObject.points += points;
        teamTwoObject.netScore += points;
        teamOneObject.netScore -= points;
        console.log(teamTwoObject.name + ' captured the base +' + points);
        console.log(teamOneObject.points + ' ' + teamTwoObject.points);
        app.sendScores(teamOneObject, teamTwoObject);
        killfeedBaseUpdate(teamTwoObject.alias, points);
      } else {
        points = 25;
        teamTwoObject.points += points;
        teamTwoObject.netScore += points;
        teamOneObject.netScore -= points;
        console.log(teamTwoObject.name + ' captured the base +' + points);
        console.log(teamOneObject.points + ' ' + teamTwoObject.points);
        app.sendScores(teamOneObject, teamTwoObject);
        killfeedBaseUpdate(teamTwoObject.alias, points);
      }
      captures++;
    }
  }
  //else it was captured by neither outfit
}

var triggerCharacter = '';//enter a character ID for someone who can /suicide to start the match

function createStream() {
  var ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);
  ws.on('open', function open() {
    console.log('stream opened');
    ws.send('{"service":"event","action":"subscribe","characters":["' + triggerCharacter + '"],"eventNames":["Death"]}');
    initialiseOverlay();
    subscribe(ws);
  });
  ws.on('message', function (data) {
    if (data.indexOf("payload") == 2) {
        dealWithTheData(data);
    }
    //store the data somewhere - possibly a txt file in case something gets disputed
  });
  captures = 0;
}

function subscribe(ws) {
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
  //facility Subscribing - subscribes to all capture data
  ws.send('{"service":"event","action":"subscribe","worlds":["1","10","13","17","19","25"],"eventNames":["FacilityControl"]}');
  //start timer
  startTimer(ws);
  console.log('Subscribed to facility and kill/death events between ' + teamOneObject.alias + ' and '  +teamTwoObject.alias);
}

function unsubscribe(ws) {
  //unsubscribes from all events
  ws.send('{"service":"event","action":"clearSubscribe","all":"true"}');
  //resubscribe to trigger characters event
  ws.send('{"service":"event","action":"subscribe","characters":["' + triggerCharacter + '"],"eventNames":["Death"]}');
  console.log('Unsubscribed from facility and kill/death events between ' + teamOneObject.alias + ' and '  +teamTwoObject.alias);
}

function startTimer(ws) {
  console.log('timer started');
  roundTracker++;
  timeCounter = 900;
  var time = setInterval(function () {
    if (timeCounter < 1) {
      clearInterval(time);
      unsubscribe(ws);
      final();
    }
    var sec = parseInt(timeCounter % 60),
        min = parseInt(timeCounter / 60);
    min = min.toString();
    if (min.length < 2) {
      min = '0' + min;
    }
    sec = sec.toString();
    if (sec.length < 2) {
      sec = '0' + sec;
    }
    var timerObj = {
      minutes: min,
      seconds: sec
    };
    var timeString = min + ' : ' + sec;
    fs.writeFile('overlay/time.txt', timeString, function (err) {
      if (err) {
        return console.log('time.txt Error: ' + err);
      }
    });
    app.timerEmit(timerObj);
    timeCounter--;
  }, 1000);
}

function stopTheMatch() {
  timeCounter = 0;
}

function startUp(tOne, tTwo) {
  items.initialise().then(function(result) {
    if (result) {
      time = Date.now();
      console.log(time + ' start match');
      console.log('=====================================================================================================================================');
      teamOne = tOne;
      teamOneObject = teamObject(teamOne);
      teamTwo = tTwo;
      teamTwoObject= teamObject(teamTwo);
      if (config.DEBUG) {
        debugWebSocket();
        app.refreshPage();
      } else {
        createStream();
        app.refreshPage();
      }
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

function final() {
  var path = 'match' + roundTracker + '.txt';
  console.log(path);
  var teamOneActivePlayers = [];
  for (keys in teamOneObject.members) {
    teamOneActivePlayers.push(teamOneObject.members[keys])
  }
  var teamOneActive = teamOneObject.name + '  ' + teamOneObject.points + '  '  + teamOneObject.netScore + '  ' + teamOneObject.kills  + '  ' + teamOneObject.kills  + '\n\n';
  teamOneActivePlayers.forEach(function (member) {
    if ((member.points > 0) || (member.netScore != 0)) {
      var memName = member.name;
      var points = member.points.toString();
      var netScore = member.netScore.toString();
      var kills = member.kills.toString();
      var deaths = member.deaths.toString();
      while (memName.length < 16) {
        memName += ' ';
      }
      while (points.length < 4) {
        points = ' ' + points;
      }
      while (netScore.length < 4) {
        netScore = ' ' + netScore;
      }
      while (kills.length < 4) {
        kills = ' ' + kills;
      }
      while (deaths.length < 4) {
        deaths = ' ' + deaths;
      }
      teamOneActive += memName + '  ' + points + '  ' + netScore + '  ' + kills + '  ' + deaths + '  ' + '\n';
    }
  });
  var teamTwoPlayers = [];
  for (keys in teamTwoObject.members) {
    teamTwoPlayers.push(teamTwoObject.members[keys])
  }
  var teamTwoActive = teamTwoObject.name + '  ' + teamTwoObject.points + '  '  + teamTwoObject.netScore + '  ' + teamTwoObject.kills  + '  ' + teamTwoObject.kills  + '\n\n';
  teamTwoPlayers.forEach(function (member) {
    if ((member.points > 0) || (member.netScore != 0)) {
      var memName = member.name;
      var points = member.points.toString();
      var netScore = member.netScore.toString();
      var kills = member.kills.toString();
      var deaths = member.deaths.toString();
      while (memName.length < 16) {
        memName += ' ';
      }
      while (points.length < 4) {
        points = ' ' + points;
      }
      while (netScore.length < 4) {
        netScore = ' ' + netScore;
      }
      while (kills.length < 4) {
        kills = ' ' + kills;
      }
      while (deaths.length < 4) {
        deaths = ' ' + deaths;
      }
      teamTwoActive += memName + '  ' + points + '  ' + netScore + '  ' + kills + '  ' + deaths + '  ' + '\n';
    }
  });
  var stats = 'Final Scores for this match:\n' + teamOneActive + '\n' + teamTwoActive;
  fs.writeFile(path, stats, function(err) {
    if (err) {
      return console.log(path +' Error: ' + err);
    }
    console.log('Match stats wrote to ' + path);

  });
}

exports.startUp = startUp;
exports.createStream = createStream;
exports.stopTheMatch = stopTheMatch;
