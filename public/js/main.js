/**
 * Created by Dylan on 15-Apr-16.
 */
var socket = io();
socket.on('connect', function() {

    socket.on('teams', function (data) {
        console.log(data);
        if (data.teamOne.name !== "") {
            var T1 = '[' + data.teamOne.alias + '] ' + data.teamOne.name;
            var T2 = '[' + data.teamTwo.alias + '] ' + data.teamTwo.name;
            if (T1.length < 30) {
                var space = 30 - T1.length;
                while (space !== 0) {
                    T1 = T1 + "\u00A0";
                    space--;
                }
            }
            if (T2.length < 30) {
                space = 30 - T2.length;
                while (space !== 0) {
                    T2 = T2 + "\u00A0";
                    space--;
                }
            }
            $('#outfitT1').html(T1).addClass('faction' + data.teamOne.faction);
            $('#outfitT2').html(T2).addClass('faction' + data.teamTwo.faction);
            $('#Team1').addClass('faction' + data.teamOne.faction);
            $('#Team2').addClass('faction' + data.teamTwo.faction);
        }
        else {
            $('#outfitT1').html("Match Not Running").addClass();
            $('#outfitT2').html("Match Not Running").addClass();
        }
    });
    socket.on ('time', function(data) {
        console.log(data);
        $('#timer').html(data.minutes + ' : ' + data.seconds);
    });
    socket.on('refresh', function () {
        window.location.reload();
    });
    socket.on('killfeed', function (event) {
        console.log(event);
        $('<tr><td class="faction' + event.winner_faction + '">' + event.winner + '</td>' +
            '<td>' + event.weapon + '</td>' +
            '<td class="faction' + event.loser_faction + '">' + event.loser + '</td>' +
            '<td>' + event.points + '</td></tr>')
            .prependTo($(killfeed));
    });

    socket.on('score', function (event) {
        console.log(event);
        $('#Team1').empty(); $('#Team2').empty();
        $('#T1Score').empty().html(event.teamOne.points); $('#T2Score').empty().html(event.teamTwo.points);
        $('<tr id="T1"><td class="pad" id="outfitScore">' + event.teamOne.alias + '</td>' +
            '<td class="pad" id="outfitScore">' + event.teamOne.points + '</td>' +
            '<td class="pad" id="outfitScore">' + event.teamOne.netScore + '</td>' +
            '<td class="pad" id="outfitScore">' + event.teamOne.kills + '</td>' +
            '<td class="pad" id="outfitScore">' + event.teamOne.deaths + '</td></tr>').appendTo($(Team1));
        $('<tr id="T2"><td class="pad" id="outfitScore">' + event.teamTwo.alias + '</trtd>' +
            '<td class="pad" id="outfitScore">' + event.teamTwo.points + '</td>' +
            '<td class="pad" id="outfitScore">' + event.teamTwo.netScore + '</td>' +
            '<td class="pad" id="outfitScore">' + event.teamTwo.kills + '</td>' +
            '<td class="pad" id="outfitScore">' + event.teamTwo.deaths + '</td></tr>').appendTo($(Team2));
        event.teamOne.members.forEach(function (member) {
            if (member.kills > 0 || member.deaths > 0) {
                $('<tr id="' + member.name +
                    '"><td class="pad" id="name">' + member.name +
                    '</td><td class="pad" id="score">' + member.points +
                    '</td><td class="pad" id="netScore">' + member.netScore +
                    '</td><td class="pad" id="kills">' + member.kills +
                    '<td class="pad" id="deaths">' + member.deaths +
                    '</td></tr>').appendTo($(Team1));
            }
        });
        event.teamTwo.members.forEach(function (member) {
            if (member.kills > 0 || member.deaths > 0) {
                $('<tr id="' + member.name +
                    '"><td class="pad" class="pad" id="name">' + member.name +
                    '</td><td class="pad" id="score">' + member.points +
                    '</td><td class="pad" id="netScore">' + member.netScore +
                    '</td><td class="pad" id="kills">' + member.kills +
                    '<td class="pad" id="deaths">' + member.deaths +
                    '</td></tr>').appendTo($(Team2));
            }
        });
    });
});

socket.emit('backchat', { obj: 'New Connection' });