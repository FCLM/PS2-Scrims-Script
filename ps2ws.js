/**
 * Created by Dylan on 03-Apr-16.
 */
const api_key   = require('./api_key.js'),
    items       = require('./items.js'),
    WebSocket   = require('ws'),
    app         = require('./app'),
    io          = require('socket.io'),
    overlay     = require('./overlay.js'),
    team        = require('./team.js');

let  teamOneObject,
     teamTwoObject,
     captures = 0,
     roundTracker = 0,
     timeCounter = 0,
     time = Date.now();

const pointNumbers = ['0','1','11','12','13','21','22','23'];

// Point Map default to thunderdome ruleset
let pointMap = {
    '0'  : { "action" : "First Base Capture",      points : 10, id : "class0"},
    '1'  : { "action" : "Subsequent Base Capture", points : 25, id : "class1"},
    '11' : { "action" : "Max v Infantry Kill",     points : 1,  id : "class11"},
    '12' : { "action" : "Max v Max Kill",          points : 3,  id : "class12"},
    '13' : { "action" : "Max Suicide",             points : -5, id : "class13"},
    '21' : { "action" : "Infantry TK",             points : -5, id : "class21"},
    '22' : { "action" : "Infantry Suicide",        points : -2, id : "class22"},
    '23' : { "action" : "Infantry v Max",          points : 5,  id : "class23"},
    'name': 'Thunderdome Ruleset'
};

// Thunderdome (2016)
const thunderdomePointMap = {'0':10, '1':25, '11':1, '12':3, '13':-5, '21':-5, '22':-2, '23':5 };

// Emerald "Durdledome" (2016)
const emeraldPointMap = { '0':10, '1':25, '11':0, '12':3, '13':-4, '21':-3, '22':-3, '23':4 };

// Briggs OvO (2017)
const ovoPointMap = { '0':12, '1':24, '11':0, '12':2, '13':-12, '21':-3, '22':-3, '23':12 };

function getPointMaps() {
    return pointMap;
}

function updatePointMap(number) {
    pointNumbers.forEach(function (data) {
        if (number === 0) { pointMap[data].points = thunderdomePointMap[data]; }
        else if (number === 1) { pointMap[data].points = emeraldPointMap[data]; }
        else if (number === 2) { pointMap[data].points = ovoPointMap[data]; }
    });
    if (number === 0) { pointMap['name'] = 'Thunderdome'; }
    if (number === 1) { pointMap['name'] = 'Emerald'; }
    if (number === 2) { pointMap['name'] = 'Briggs OvO'; }
}

function individualPointUpdate(event) {
    if (event.class0  !== '') { pointMap['0'].points = event.class0; }
    if (event.class1  !== '') { pointMap['1'].points = event.class1; }
    if (event.class11 !== '') { pointMap['11'].points = event.class11; }
    if (event.class12 !== '') { pointMap['12'].points = event.class12; }
    if (event.class13 !== '') { pointMap['13'].points = event.class13; }
    if (event.class21 !== '') { pointMap['21'].points = event.class21; }
    if (event.class22 !== '') { pointMap['22'].points = event.class22; }
    if (event.class23 !== '') { pointMap['23'].points = event.class23; }
    pointMap.name = 'Custom';
}

function getRound() { return roundTracker; }

function sendScore() {
    if(roundTracker !== 0) {
        if (teamOneObject.name !== undefined) {
            app.sendScores(teamOneObject, teamTwoObject);
        }
    }
}

function dealWithTheData(raw) {
    raw = raw.replace(': :', ':');
    const data = JSON.parse(raw).payload;
    if (data.event_name === "Death") {
        itsPlayerData(data);
    } else if (data.name === "Death") {
        //debugging match only
        itsPlayerData(data);
    } else {
        itsFacilityData(data);
    }
}

function itsPlayerData(data) {
    // deals with adding points to the correct player & team
    const item = items.lookupItem(data.attacker_weapon_id);
    let points = items.lookupPointsfromCategory(item.category_id);
    if ((data.attacker_loadout_id === 7) || (data.attacker_loadout_id === 14) || (data.attacker_loadout_id === 21)) {
        // Attacker using a max
        if ((data.character_loadout_id === 7) || (data.character_loadout_id === 14) || (data.character_loadout_id === 21)) {
            // Attacker used a max to kill a max
            points = pointMap['12'].points;
        } else {
            // max v infantry
            points = pointMap['11'].points;
        }
    } else if ((data.character_loadout_id === 7) || (data.character_loadout_id === 14) || (data.character_loadout_id === 21)) {
        // defender used a max
        points = pointMap['23'].points;
    }
    if ((teamOneObject.members.hasOwnProperty(data.attacker_character_id)) && (teamTwoObject.members.hasOwnProperty(data.character_id))) {
        oneIvITwo(data, points, item);
    } else if ((teamTwoObject.members.hasOwnProperty(data.attacker_character_id)) && (teamOneObject.members.hasOwnProperty(data.character_id))) {
        twoIvIOne(data, points, item);
    } else if ((data.attacker_character_id === data.character_id) && (teamOneObject.members.hasOwnProperty(data.character_id))){
        if ((data.character_loadout_id === 7) || (data.character_loadout_id === 14) || (data.character_loadout_id === 21)) {
            // suicided as a max lol
            points = pointMap['13'].points;
        } else {
            // just infantry suicide
            points = pointMap['22'].points;
        }
        teamOneSuicide(data, points, item);
    } else if ((data.attacker_character_id === data.character_id) && (teamTwoObject.members.hasOwnProperty(data.character_id))){
        if ((data.character_loadout_id === 7) || (data.character_loadout_id === 14) || (data.character_loadout_id === 21)) {
            // suicided as a max lol
            points = pointMap['13'].points;
        } else {
            // just infantry suicide
            points = pointMap['22'].points;
        }
        teamTwoSuicide(data, points, item);
    } else if ((teamOneObject.members.hasOwnProperty(data.attacker_character_id)) && (teamOneObject.members.hasOwnProperty(data.character_id))) {
        // Hahahaha he killed his mate
        teamOneTeamkill(data, item, pointMap['21'].points);
    } else if ((teamTwoObject.members.hasOwnProperty(data.attacker_character_id)) && (teamTwoObject.members.hasOwnProperty(data.character_id))) {
        // Hahahaha he killed his mate
        teamTwoTeamkill(data, item, pointMap['21'].points);
    }
    app.sendScores(teamOneObject, teamTwoObject);
    overlay.updateScoreOverlay(teamOneObject, teamTwoObject);
}

function oneIvITwo (data, points, item) {
    team.oneIvITwo(data.attacker_character_id, data.character_id, points, item);
    //create a JSON and send it to the web
    const obj = {
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
    overlay.updateKillfeedPlayer(obj);
}

function twoIvIOne (data, points, item) {
    team.twoIvIOne(data.character_id, data.character_id, points, item);
    //create a JSON and send it to the web
    const obj = {
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
    overlay.updateKillfeedPlayer(obj);
}

function teamOneSuicide (data, points, item) {
    team.oneSuicide(one, points);
    //create a JSON and send it to the web
    const obj = {
        winner: teamOneObject.members[data.attacker_character_id].name,
        winner_faction: teamOneObject.faction,
        loser: teamOneObject.members[data.character_id].name,
        loser_faction: teamOneObject.faction,
        weapon: item.name,
        image: item.image,
        points: points,
        time: 0
    };
    app.killfeedEmit(obj);
    overlay.updateKillfeedPlayer(obj);
}

function teamTwoSuicide (data, points, item) {
    team.twoSuicide(data.attacker_character_id, points);
    //create a JSON and send it to the web
    const obj = {
        winner: teamTwoObject.members[data.attacker_character_id].name,
        winner_faction: teamTwoObject.faction,
        loser: teamTwoObject.members[data.character_id].name,
        loser_faction: teamTwoObject.faction,
        weapon: item.name,
        image: item.image,
        points: points,
        time: 0
    };
    app.killfeedEmit(obj);
    overlay.updateKillfeedPlayer(obj);
}

function teamOneTeamkill (data, item, points) {
    team.oneTeamKill(data.attacker_character_id, data.character_id, points);
    //create a JSON and send it to the web
    const obj = {
        winner: teamOneObject.members[data.attacker_character_id].name,
        winner_faction: teamOneObject.faction,
        loser: teamOneObject.members[data.character_id].name,
        loser_faction: teamOneObject.faction,
        weapon: item.name,
        image: item.image,
        points: points,
        time: 0
    };
    app.killfeedEmit(obj);
    overlay.updateKillfeedPlayer(obj);
}

function teamTwoTeamkill (data, item, points) {
    team.twoTeamKill(data.attacker_character_id, data.character_id, points);
    //create a JSON and send it to the web
    const obj = {
        winner: teamTwoObject.members[data.attacker_character_id].name,
        winner_faction: teamTwoObject.faction,
        loser: teamTwoObject.members[data.character_id].name,
        loser_faction: teamTwoObject.faction,
        weapon: item.name,
        image: item.image,
        points: points,
        time: 0
    };
    app.killfeedEmit(obj);
    overlay.updateKillfeedPlayer(obj);
}

function itsFacilityData(data) {
    //deals with adding points to the correct team
    if (data.new_faction_id !== data.old_faction_id) {
        if (data.outfit_id === teamOneObject.outfit_id) {
            if (captures === 0) {
                team.oneBaseCap(pointMap['0'].points);
                app.sendScores(teamOneObject, teamTwoObject);
                overlay.updateKillfeedFacility(teamOneObject.alias,points);
            } else {
                team.oneBaseCap(pointMap['1'].points);
                app.sendScores(teamOneObject, teamTwoObject);
                overlay.updateKillfeedFacility(teamOneObject.alias,points);
            }
            captures++;
        } else if (data.outfit_id === teamTwoObject.outfit_id) {
            if (captures === 0) {
                team.twoBaseCap(pointMap['0'].points);
                app.sendScores(teamOneObject, teamTwoObject);
                overlay.updateKillfeedFacility(teamTwoObject.alias,points);
            } else {
                team.twoBaseCap(pointMap['1'].points);
                app.sendScores(teamOneObject, teamTwoObject);
                overlay.updateKillfeedFacility(teamTwoObject.alias,points);
            }
            captures++;
        }
    }
    //else it was captured by neither outfit
}

function createStream() {
    const ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);
    ws.on('open', function open() {
        console.log('stream opened');
        subscribe(ws);
    });
    ws.on('message', function (data) {
        if (data.indexOf("payload") === 2) {
            dealWithTheData(data);
        }
    });
    captures = 0;
}

function subscribe(ws) {
    //team1 subscribing
    //{"service":"event","action":"subscribe","characters":["5428010618035589553"],"eventNames":["Death"]}
    teamOneObject.memberArray.forEach(function (member) {
        ws.send('{"service":"event","action":"subscribe","characters":["' + member.character_id + '"],"eventNames":["Death"]}');
    });
    //team2 subscribing
    teamTwoObject.memberArray.forEach(function (member) {
        ws.send('{"service":"event","action":"subscribe","characters":["' + member.character_id + '"],"eventNames":["Death"]}');
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
    console.log('Unsubscribed from facility and kill/death events between ' + teamOneObject.alias + ' and '  +teamTwoObject.alias);
}

function startTimer(ws) {
    console.log('timer started');
    roundTracker++;
    timeCounter = 900;
    let time = setInterval(function () {
        if (timeCounter < 1) {
            clearInterval(time);
            unsubscribe(ws);
            overlay.writeFinalStats(teamOneObject,teamTwoObject);
            app.matchFinished();
        }
        overlay.updateTime(timeCounter);
        timeCounter--;
    }, 1000);
}

function stopTheMatch() {
    timeCounter = 0;
}

function startUp() {
    items.initialise().then(function() {
        time = Date.now();
        console.log(time + ' start match');
        console.log('=====================================================================================================================================');
        teamOneObject = team.getT1();
        teamTwoObject = team.getT2();
        createStream();
        app.refreshPage();
    }).catch(function (err) {
        console.error('Items did not initialise!!');
        console.error(err);
    });
}

exports.startUp        = startUp;
exports.createStream   = createStream;
exports.stopTheMatch   = stopTheMatch;
exports.sendScore      = sendScore;
exports.getPointMaps   = getPointMaps;
exports.updatePointMap = updatePointMap;
exports.individualPointUpdate = individualPointUpdate;
exports.getRound       = getRound;