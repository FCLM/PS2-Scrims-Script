/**
 * Created by Dylan on 15-Apr-16.
 */
var socket = io();

function submitForm (button)
{
    if (button.value == "Track") {
        var track = $('#start');
        track.prop('disabled', true);
        var tagOne = $("#T1Tag").val();
        var tagTwo = $("#T2Tag").val();
        var pw = $('#pwStart').val();
        var obj = {
            teamOne : tagOne,
            teamTwo : tagTwo,
            auth: pw
        };
        console.log(obj);
        socket.emit('start', { obj: obj});
    } else if (button.value == "Stop") {
        var stop = $('#stop');
        stop.prop('disabled', true);
        pw = $('#pwstop').val();
        obj = {
            auth: pw
        };
        socket.emit('stop', { obj: obj});
        console.log(pw);
    } else if (button.value == "Start Second Round") {
        var round2 = $('#Round2');
        round2.prop('disabled', true);
        pw = $('#pwRound2').val();
        obj = {
            auth: pw
        };
        socket.emit('newRound', { obj: obj});
        console.log(pw);
    }
    return false;
}

socket.on('connect', function() {
    socket.on ('redirect', function() {
    //redirect to index.html
        console.log('Session started, redirecting to index.html');
        window.location.replace("/");
    });
});

socket.emit('backchat', { obj: 'Admin - Web Connection' });