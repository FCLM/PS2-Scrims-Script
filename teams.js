/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key = require('./api_key.KEY');
var request = require('request');
var prequest = require('prequest');
var Q = require('q');

//https://census.daybreakgames.com/get/ps2/outfit/?alias=FCLM&c:resolve=member_character(name)&c:hide=time_created

function team(teamTag) {
    var response = Q.defer();
    teamTag = teamTag.toLowerCase();
    prequest('https://census.daybreakgames.com/s:' + api_key + '/get/ps2/outfit/?alias_lower='+ teamTag + '&c:resolve=member_character(name)').then(function (body) {
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
            members : teamPlayers
        };
        response.resolve(obj);
    }).catch(function (err) { // Any HTTP status >= 400 falls here
        response.reject(err);
    });
    return response.promise;
}
function fetchTeamData(teamOneTag, teamTwoTag) {
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
}

exports.fetchTeamData = fetchTeamData;
