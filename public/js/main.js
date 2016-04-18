/**
 * Created by Dylan on 15-Apr-16.
 */
var socket = io();
socket.on('connect', function() {
    socket.on('teams', function (data) {
        var event = data.obj;
        console.log(event);
        $('#outfitT1').html('[' + event.teamOne.alias + '] ' + event.teamOne.name).addClass('faction' + event.teamOne.faction);
        $('#outfitT2').html('[' + event.teamTwo.alias + '] ' + event.teamTwo.name).addClass('faction' + event.teamTwo.faction);
        $('#Team1').addClass('faction' + event.teamOne.faction);
        $('#Team2').addClass('faction' + event.teamTwo.faction);
    });
    socket.on ('time', function(data) {
        var event = data.obj;
        $('#timer').html(event.minutes + ' : ' + event.seconds);
    });
    socket.on('refresh', function () {
        window.location.reload();
    });
    socket.on('killfeed', function (data) {
        var event = data.obj;
        console.log(event);
        $('<tr><td class="faction' + event.winner_faction + '">' + event.winner + '</td>' +
            '<td class="faction' + event.loser_faction + '">' + event.loser + '</td>' +
            '<td>' + event.weapon + '</td>' +
            '<td>' + event.image + '</td>' +
            '<td>' + event.points + '</td></tr>')
            .prependTo($(killfeed));
    });
    socket.on('score', function (data) {
        var event = data.obj;
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
socket.emit('backchat', { obj: 'Web Connection' });