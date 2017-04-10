/**
 * Created by dylancross on 4/04/17.
 */

let t1 = {
    alias : '',
    outfit_id : '',
    name : '',
    faction : '',
    points : 0,
    netScore : 0,
    kills : 0,
    deaths : 0,
    baseCaps: 0,
    members : {},
    memberArray : []
};

let t2 = {
    alias : '',
    outfit_id : '',
    name : '',
    faction : '',
    points : 0,
    netScore : 0,
    kills : 0,
    deaths : 0,
    baseCaps: 0,
    members : {},
    memberArray : []
};

function setTeams(one, two) {
    t1.alias = one.alias;
    t1.outfit_id = one.outfit_id;
    t1.name = one.name;
    t1.faction = one.faction;
    t1.points = 0;
    t1.netScore = 0;
    t1.kills = 0;
    t1.deaths = 0;
    t1.baseCaps = 0;
    t1.memberArray = one.members;
    one.members.forEach(function(member) {
        t1.members[member.character_id] = {
            name: member.name,
            points: 0,
            netScore: 0,
            kills: 0,
            deaths: 0
        };
    });

    t2.alias = two.alias;
    t2.outfit_id = two.outfit_id;
    t2.name = two.name;
    t2.faction = two.faction;
    t2.points = 0;
    t2.netScore = 0;
    t2.kills = 0;
    t2.deaths = 0;
    t2.baseCaps = 0;
    t2.memberArray = two.members;
    two.members.forEach(function(member) {
        t2.members[member.character_id] = {
            name: member.name,
            points: 0,
            netScore: 0,
            kills: 0,
            deaths: 0
        };
    });
}

function getT1() { return t1; }

function getT2() { return t2; }

function oneIvITwo(one, two, points, item) {
    t1.points += points;
    t1.netScore += points;
    t1.kills++;
    t1.members[one].points += points;
    t1.members[one].netScore += points;
    t1.members[one].kills++;

    t2.deaths++;
    t2.netScore -= points;
    t2.members[two].netScore -= points;
    t2.members[two].deaths++;

    // logging
    console.log(t1.members[one].name + ' -->  ' + t2.members[two].name + ' for ' + points + ' points (' + item.name + ')');
    logScore();
}

function twoIvIOne(two, one, points, item) {
    t2.points += points;
    t2.netScore += points;
    t2.kills++;
    t2.members[two].points += points;
    t2.members[two].netScore += points;
    t2.members[two].kills++;

    t1.netScore -= points;
    t1.deaths++;
    t1.members[one].netScore -= points;
    t1.members[one].deaths++;

    // logging
    console.log(t2.members[two].name + ' -->  ' + t1.members[one].name + ' for ' + points + ' points (' + item.name + ')');
    logScore();
}

function oneSuicide(one, points) {
    t1.points += points;
    t1.netScore += points;
    t1.deaths++;
    t1.members[one].points += points;
    t1.members[one].netScore += points;
    t1.members[one].deaths++;

    // logging
    console.log(t1.members[one].name + ' killed themselves ' + points);
    logScore();
}

function twoSuicide(two, points) {
    t2.points += points;
    t2.netScore += points;
    t2.deaths++;
    t2.members[two].points += points;
    t2.members[two].netScore += points;
    t2.members[two].deaths++;

    //logging
    console.log(t2.members[two].name + ' killed themselves ' + points);
    logScore();
}

function oneTeamKill(killer, killed, points) {
    t1.points += points;
    t1.netScore += points;
    t1.deaths++;
    t1.members[killer].points += points;
    t1.members[killer].netScore += points;

    t1.members[killed].deaths++;

    // logging
    console.log(t1.members[killer].name + ' team killed ' + t1.members[killed].name + ' ' + points);
    logScore();
}

function twoTeamKill(killer, killed, points) {
    t2.points += points;
    t2.netScore += points;
    t2.deaths++;
    t2.members[killer].points += points;
    t2.members[killer].netScore += points;

    t2.members[killed].deaths++;

    // logging
    console.log(t2.members[killer].name + ' team killed ' + t2.members[killed].name + ' ' + points);
    logScore();
}

function oneBaseCap(points) {
    t1.points += points;
    t1.netScore += points;
    t1.baseCaps++;
    t2.netScore -= points;

    // logging
    console.log(t1.name + ' captured the base +' + points);
    logScore();
}

function twoBaseCap(points) {
    t2.points += points;
    t2.netScore += points;
    t2.baseCaps++;
    t1.netScore -= points;

    // logging
    console.log(t2.name + ' captured the base +' + points);
    logScore();
}

// Adjust the scores, possibly due to sanctions imposed by an admin or other reasons...
function adjustScore(team1, team2, reason) {
    if (team1 !== '' && t1.outfit_id !== '') {
        t1.points += team1;
        t1.netScore += team1;
        t2.netScore -= team1;
        // Check if team has already been sanctioned
        if (!t1.members.hasOwnProperty(reason)) {
            t1.members[reason].points += team1;
            t1.members[reason].netScore += team1;
        } else {
            t1.members[reason] = {
                name: reason,
                points: team1,
                netScore: team1,
                kills: 0,
                deaths: 0
            };
        }
    }
    if (team2 !== '' && t2.outfit_id !== '') {
        t2.points += team2;
        t2.netScore += team2;
        t1.netScore -= team2;
        // Check if team has already been sanctioned
        if (!t2.members.hasOwnProperty(reason)) {
            t2.members[reason].points += team2;
            t2.members[reason].netScore += team2;
        } else {
            t2.members[reason] = {
                name: reason,
                points: team2,
                netScore: team2,
                kills: 0,
                deaths: 0
            };
        }
    }
}

function logScore() {
    console.log(t1.points + ' ' + t2.points);
}

exports.setTeams    = setTeams;
exports.getT1       = getT1;
exports.getT2       = getT2;
exports.oneIvITwo   = oneIvITwo;
exports.twoIvIOne   = twoIvIOne;
exports.oneSuicide  = oneSuicide;
exports.twoSuicide  = twoSuicide;
exports.oneTeamKill = oneTeamKill;
exports.twoTeamKill = twoTeamKill;
exports.oneBaseCap  = oneBaseCap;
exports.twoBaseCap  = twoBaseCap;
exports.adjustScore = adjustScore;