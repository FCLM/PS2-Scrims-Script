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
  var idx = name.indexOf('x')
  if (idx > 0 && idx < 5) {
    name = name.substring(idx + 1, name.length);
  }
  return name;
}

function fetchTeamData(teamTag) {
  var response = Q.defer();
  teamTag = teamTag.toLowerCase();
  var url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2/outfit/?alias_lower='+ teamTag + '&c:resolve=leader(faction_id),member_character(name)&c:hide=time_created,time_created_date';
  prequest(url).then(function (body) {
    var teamPlayers = [];
    body.outfit_list[0].members.forEach(function(result) {

      if ((result.hasOwnProperty('name')) && (result.name.hasOwnProperty('first')))  {
        memName = removeNameParts(result.name.first);
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