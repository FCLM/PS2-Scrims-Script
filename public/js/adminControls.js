/**
 * Created by Dylan on 15-Apr-16.
 */
var socket = io();
var form = document.getElementById('start');
document.addEventListener('submit', function(e) {
    e.preventDefault();
    var tagOne = $("#T1Tag").val();
    var tagTwo = $("#T2Tag").val();
    var obj = {
        teamOne : tagOne,
        teamTwo : tagTwo
    };
    console.log(obj);
    socket.emit('start', { obj: obj});
});
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
        console.log(event);
        $('#timer').html(event.minutes + ' : ' + event.seconds);
    });
    socket.on ('redirect', function(data) {
    //redirect to index.html
    });
});