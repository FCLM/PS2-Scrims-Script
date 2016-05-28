/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key = require('./api_key.js');
var prequest = require('prequest');
var Q = require('q');

//https://census.daybreakgames.com/get/ps2:v2/outfit/?alias_lower=fcln&c:resolve=leader(faction_id),member_character(name)&c:hide=time_created
//factions: 0 - NS, 1 - VS, 2 - NC, 3 - TR

function removeNameParts(name) {
  // remove faction from end
  var end = name.length-2;
  if (name.indexOf('VS') == end || name.indexOf('NC') == end || name.indexOf('TR') == end) {
    name = name.substring(0, end);
  }
  // remove start tag
  var idx = name.indexOf('x');
  if (idx > 0 && idx < 5) {
    name = name.substring(idx + 1, name.length);
  }
  return name;
}

// add the character ids and the desired name as well as the actual characters name for reference later
// commas on all curly brackets except for the last set
var alias = {
  "1234564321" : {
    name : "example",
    actual : "Not a Real Character"
  },
  "12345643221321" : {
    name : "example2",
    actual : "Not a Real Character"
  },
  "5428285306548260065" : {
    name : "Laser",
    actual : "FCLMxPractice1VS"
  },
  "5428285306548260161" : {
    name : "Powerdown",
    actual : "FCLMxPractice2VS"
  },
  "5428285306548260257" : {
    name : "Narcasse",
    actual : "FCLMxPractice3VS"
  },
  "5428285306548260353" : {
    name : "RHSixSixOne",
    actual : "FCLMxPractice4VS"
  },
  "5428285306548265121" : {
    name : "RetroGhost4",
    actual : "JUGAxPractice1VS"
  },
  "5428285306548265217" : {
    name : "Pazzword",
    actual : "JUGAxPractice2VS"
  },
  "5428285306548265345" : {
    name : "Dragonroco",
    actual : "JUGAxPractice3VS"
  },
  "5428285306548264833" : {
    name : "Jarrodlebox",
    actual : "JUGAxJackmacVS"
  },
  "5428285306548264929" : {
    name : "RetroLegacy",
    actual : "JUGAxNiocoraVS"
  },
  "5428285306548265025" : {
    name : "Coolys1000",
    actual : "JUGAxGootsVS"
  },
  "5428285306548263681" : {
    name : "TheOriginalDirt",
    actual : "SOCAxPractice1TR"
  },
  "5428285306548263841" : {
    name : "DonkeyRainbows",
    actual : "SOCAxPractice2TR"
  },
  "5428285306548264033" : {
    name : "Polarisation",
    actual : "SOCAxPractice3TR"
  },
  "5428285306548266273" : {
    name : "Fallin",
    actual : "RSNCxPractice1NC"
  },
  "5428285306548266369" : {
    name: "Syreni",
    actual: "RSNCxPractice2NC"
  },
  "5428285306548266465" : {
    name : "LtDavidson",
    actual : "RSNCxPractice3NC"
  },
  "5428285306548266561" : {
    name : "60Seconds",
    actual : "RSNCxPractice4NC"
  }
};

function fetchTeamData(teamTag) {
  var response = Q.defer();
  teamTag = teamTag.toLowerCase();
  var url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2/outfit/?alias_lower='+ teamTag + '&c:resolve=leader(faction_id),member_character(name)&c:hide=time_created,time_created_date';
  prequest(url).then(function (body) {
    var teamPlayers = [];
    body.outfit_list[0].members.forEach(function(result) {
      if ((result.hasOwnProperty('name')) && (result.name.hasOwnProperty('first')))  {
        var memName = '';
        if (alias.hasOwnProperty(result.character_id)) {
          memName = alias[result.character_id].name;
        } else {
          memName = removeNameParts(result.name.first);
        }
        teamPlayers.push({
          character_id: result.character_id,
          name: memName
        });
      } else {
        console.error('ERROR: there is a character that does not have a name (has been deleted): ' + result.character_id);
      }
    });
    var obj = {
      alias : body.outfit_list[0].alias,
      outfit_id : body.outfit_list[0].outfit_id,
      name : body.outfit_list[0].name,
      faction : body.outfit_list[0].leader.faction_id,
      members : teamPlayers
    };
    response.resolve(obj);

  }).catch(function (err) { // Any HTTP status >= 400 falls here
    response.reject(err);
  });
  return response.promise;
}

exports.fetchTeamData = fetchTeamData;
exports.removeNameParts = removeNameParts;