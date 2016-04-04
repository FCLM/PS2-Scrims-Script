/**
 * Created by Dylan on 03-Apr-16.
 */
var api_key = require('./api_key.KEY');
var teams = require('./teams.js');

var WebSocket = require('ws');
var teamOneScore = 0, teamTwoScore = 0;
var rockets = [];
var max = [];


function dealWithTheData(data) {
    //decides whether it is player data or facility data
    if (data.payload.event_name == "Death") {
        itsPlayerData(data);
    } else {
        itsFacilityData(data);
    }
}

function itsPlayerData(data) {
    //deals with adding points to the correct player & team
    if (data.payload.attacker_weapon_id == ) {
        //deal with rocket kills
        rocketKill(data);
    } else if() {
        //if killer loadout is a max :(
        maxKiller(data);
    } else if() {
        //if player killed someone in a max
        maxKilled(data);
    } else if (data.payload.attacker_weapon_id == ) {
        //deal with +1 kills
        plusOneKill(data);
    } else {
        //must be a standard +2
        plusTwoKill(data);
    }
    //store data

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
    //store the data somewhere

}

function createStream(teamOne, teamTwo, facilityID) {
    var ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key);

    ws.on('open', function open() {
        //team1 subscribing
        //{"service":"event","action":"subscribe","characters":["5428010618035589553"],"eventNames":["Death"]}
        teamOne.members.forEach(function () {
            ws.send('{"service":"event","action":"subscribe","characters":["' + teamOne.members.character_id +'"],"eventNames":["Death"]}');
            console.log('Sent: {"service":"event","action":"subscribe","characters":["' + teamOne.members.character_id +'"],"eventNames":["Death"]}')
        });

        //team2 subscribing

        teamTwo.members.forEach(function () {
            ws.send('{"service":"event","action":"subscribe","characters":["' + teamOne.members.character_id + '"],"eventNames":["Death"]}');
            console.log('Sent: {"service":"event","action":"subscribe","characters":["' + teamOne.members.character_id + '"],"eventNames":["Death"]}');
        });

        //facility Subscribing
        ws.send('{"service":"event","action":"subscribe","worlds":["1","10","13","17","19","25"],"eventNames":["FacilityControl"]}');
        console.log('Sent: {"service":"event","action":"subscribe","characters":["' + teamOne.members.character_id + '"],"eventNames":["Death"]}');
        //not correct currently - subscribes to all, i guess it could just be that and then if the facility is the right one then add points to corresponding team

        //
    });

    ws.on('message', function (data, flags) {
        // flags.binary will be set if a binary data is received.
        // flags.masked will be set if the data was masked.
        console.log('Recieved: ' + data);
        if (data.payload.type == "serviceMessage") {
            dealWithTheData(data);
        }

    });

}