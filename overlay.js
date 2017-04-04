/**
 * Created by dylancross on 4/04/17.
 * The functions on this page are used to create the overlay utilised in streams
 */

const app   = require('./app.js'),
      ps2ws = require('./ps2ws.js'),
      fs    = require('fs');

const t1Score   = 'overlay/scoreT1.txt',
      t1Players = 'overlay/playersT1.txt',
      t2Score   = 'overlay/scoreT2.txt',
      t2Players = 'overlay/playersT2.txt',
      time      = 'overlay/time.txt',
      killfeed  = 'overlay/killfeed.txt';

// Three previous kills/caps stored to enable 3 events to be displayed
let p1Kill = '',
    p2Kill = '',
    p3Kill = '';

function write(filename, data) {
    fs.writeFile(filename, data, function (err) {
        if (err) {
            console.log(filename + ' ' + err);
        }
    })
}

// Adjust the members name to ensure a uniform layout on the screen
function lengthenName(name) {
    if (name.length > 16) {
        name = name.substring(0,15) + '.';
    }
    while (name.length < 16) {
        name += ' ';
    }
    return name;
}

// Adjust the stats to ensure a uniform layout on the screen
function lengthenStats(stat) {
    while (stat.length < 4) {
        stat = ' ' + stat;
    }
    return stat;
}

function initialise() {
    write(t1Score, '0');
    write(t2Score, '0');
    write(t1Players, '');
    write(t1Players, '');
    write(time, '15 : 00');
    write(killfeed, '');
}

// Takes in the two team objects, writes the current scores
function updateScoreOverlay(t1Object, t2Object) {
    let one = playerNetscore(t1Object);
    write(t1Players, one);
    write(t1Score, t1Object.points);

    let two = playerNetscore(t2Object);
    write(t2Players, two);
    write(t2Score, t2Object.points);
}

function playerNetscore(team) {
    let activePlayers = [];
    for (keys in team.members) {
        activePlayers.push(team.members[keys])
    }

    let active = '';
    let i = 0;

    activePlayers.forEach(function (member) {
        if ((member.points > 0) || (member.netScore !== 0)) {
            let memName = lengthenName(member.name);
            let netScore = lengthenStats(member.netScore.toString());

            active += memName + '  ' + netScore;

            if (i % 2 === 0) {
                active += ' | '; i++;
            } else {
                active += '\n'; i++;
            }
        }
    });

    return active;
}

// Take in the current counter and break it in to minutes/seconds remaining
function updateTime(timeCounter) {
    let sec = parseInt(timeCounter % 60),
        min = parseInt(timeCounter / 60);

    min = min.toString();
    if (min.length < 2) {
        min = '0' + min;
    }

    sec = sec.toString();
    if (sec.length < 2) {
        sec = '0' + sec;
    }

    let timerObj = {
        minutes: min,
        seconds: sec
    };
    app.timerEmit(timerObj);
    write(time, min + ' : ' + sec);
}

function updateKillfeedPlayer(killObj) {
    p3Kill = p2Kill;
    p2Kill = p1Kill;
    let killer = lengthenName(killObj.winner);
    let weapon = lengthenName('[' + killObj.weapon + ']');
    let  killed = lengthenName(killObj.loser);
    p1Kill = killer + ' ' + weapon + '  ' + killed + '\n';
    write(killed, p1Kill + p2Kill + p3Kill);
}

function updateKillfeedFacility(tag, points) {
    p3Kill = p2Kill;
    p2Kill = p1Kill;
    p1Kill = '       [' + tag + '] Captured the base (+' + points + ')\n';
    write(killfeed, p1Kill + p2Kill + p3Kill);
}

function writeFinalStats(t1Object, t2Object) {
    const full = 'match/' + ps2ws.getRound() + '.txt',
          one  =  'match/' + ps2ws.getRound() + 'TeamOne.txt',
          two  =  'match/' + ps2ws.getRound() + 'TeamTwo.txt';
    let t1 = playerStats(t1Object);
    let t2 = playerStats(t2Object);

    write(full, 'Final Scores for this match:\n\n' + t1 + '\n\n' + t2);
    write(one, t1);
    write(two, t2);
}

function playerStats(team) {
    let activePlayers = [];
    for (keys in team.members) {
        activePlayers.push(team.members[keys])
    }
    let active = lengthenName(team.alias) + '  ' + lengthenStats(team.points.toString()) + '  '  + lengthenStats(team.netScore.toString())
        + '  ' + lengthenStats(team.kills.toString())  + '  ' + lengthenStats(team.deaths.toString())  + '\n\n';

    activePlayers.forEach(function (member) {
        if ((member.points > 0) || (member.netScore !== 0)) {
            const memName = lengthenName(member.name);
            const points = lengthenStats(member.points.toString());
            const netScore = lengthenStats(member.netScore.toString());
            const kills = lengthenStats(member.kills.toString());
            const deaths = lengthenStats(member.deaths.toString());
            active += memName + '  ' + points + '  ' + netScore + '  ' + kills + '  ' + deaths + '  ' + '\n';
        }
    });
}

exports.initialise             = initialise;
exports.updateScoreOverlay     = updateScoreOverlay;
exports.updateTime             = updateTime;
exports.updateKillfeedPlayer   = updateKillfeedPlayer;
exports.updateKillfeedFacility = updateKillfeedFacility;
exports.writeFinalStats        = writeFinalStats;