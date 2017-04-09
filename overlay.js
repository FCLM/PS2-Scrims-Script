/**
 * Created by dylancross on 4/04/17.
 * The functions on this page are used to create the overlay utilised in streams
 */

const app    = require('./app.js'),
      ps2ws  = require('./ps2ws.js'),
      fs     = require('fs'),
      teams  = require('./team.js');

const t1Score   = __dirname + '/overlay/scoreT1.txt',
      t1Players = __dirname + '/overlay/playersT1.txt',
      t2Score   = __dirname + '/overlay/scoreT2.txt',
      t2Players = __dirname + '/overlay/playersT2.txt',
      time      = __dirname + '/overlay/time.txt',
      killfeed  = __dirname + '/overlay/killfeed.txt';

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
function updateScoreOverlay() {
    let one = playerNetscore(teams.getT1());
    write(t1Players, one);
    one = teams.getT1();
    write(t1Score, one.points);

    let two = playerNetscore(teams.getT2());
    write(t2Players, two);
    two = teams.getT2();
    write(t2Score, two.points);
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

    app.send('time', timerObj);
    write(time, min + ' : ' + sec);
}

function updateKillfeedPlayer(killObj) {
    p3Kill = p2Kill;
    p2Kill = p1Kill;
    p1Kill = lengthenName(killObj.winner) + ' ' + lengthenName('[' + killObj.weapon + ']') + '  ' + lengthenName(killObj.loser) + '\n';
    write(killed, p1Kill + p2Kill + p3Kill);
}

function updateKillfeedFacility(tag, points) {
    p3Kill = p2Kill;
    p2Kill = p1Kill;
    p1Kill = '       [' + tag + '] Captured the base (+' + points + ')\n';
    write(killfeed, p1Kill + p2Kill + p3Kill);
}

function startKillfeed() {
    p3Kill = ''; p2Kill = '';
    p1Kill = ' --- Match Started --- \n';
    write(killfeed, p1Kill + p2Kill + p3Kill);
}

function writeFinalStats() {
    const round = ps2ws.getRound();
    const full = __dirname + '/match/' + round + '.txt',
          one  = __dirname + '/match/' + round + 'TeamOne.txt',
          two  = __dirname + '/match/' + round + 'TeamTwo.txt';
    const t1 = playerStats(teams.getT1());
    const t2 = playerStats(teams.getT2());

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

    active += '\nBase Captures: ' + team.baseCaps;
}

exports.initialise             = initialise;
exports.updateScoreOverlay     = updateScoreOverlay;
exports.updateTime             = updateTime;
exports.startKillfeed          = startKillfeed;
exports.updateKillfeedPlayer   = updateKillfeedPlayer;
exports.updateKillfeedFacility = updateKillfeedFacility;
exports.writeFinalStats        = writeFinalStats;