/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key = require('./api_key.js');
var prequest = require('prequest');
var Q = require('q');

//https://census.daybreakgames.com/get/ps2/outfit/?alias=FCLM&c:resolve=member_character(name)&c:hide=time_created
//https://census.daybreakgames.com/get/ps2:v2/outfit/?alias_lower=fcln&c:resolve=leader(faction_id),member_character(name)&c:hide=time_created
//factions: 0 - NS, 1 - VS, 2 - NC, 3 - TR

function fetchTeamData(teamTag) {
  var response = Q.defer();
  console.log(teamTag);
  teamTag = teamTag.toLowerCase();
  console.log(teamTag);
  prequest('https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2/outfit/?alias_lower='+ teamTag + '&c:resolve=leader(faction_id),member_character(name)&c:hide=time_created,time_created_date').then(function (body) {
    var teamPlayers = [];
    body.outfit_list[0].members.forEach(function(result) {
      teamPlayers.push({
        character_id: result.character_id,
        name: result.name.first
      });
    });
    var obj = {
      alias : body.outfit_list[0].alias,
      outfit_id : body.outfit_list[0].outfit_id,
      name : body.outfit_list[0].name,
      faction : body.outfit_list[0].leader.faction_id,
      members : teamPlayers
    };
    response.resolve(obj);
    console.log(obj);
  }).catch(function (err) { // Any HTTP status >= 400 falls here
    response.reject(err);
  });
  return response.promise;
}
/*function fetchTeamData(teamOneTag, teamTwoTag) {
 var response = Q.defer();
 var teamOneObject, teamTwoObject;
 var promises = []
 promises.push(team(teamOneTag));
 promises.push(team(teamTwoTag));

 Q.allSettled(promises).then(function (results) {
 teamOneObject = results[0].value;
 teamTwoObject = results[1].value;
 console.log(teamOneObject.name + '\t\t' + teamOneObject.outfit_id + '\n' + teamTwoObject.name + '\t\t' + teamTwoObject.outfit_id);
 return response.promise;
 });
 }*/

exports.fetchTeamData = fetchTeamData;
