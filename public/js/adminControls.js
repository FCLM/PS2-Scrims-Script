/**
 * Created by Dylan on 15-Apr-16.
 */
var socket = io();

function submitForm (button)
{
    if (button.value === "Track") {
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
        socket.emit('start', { obj: obj});
    } else if (button.value === "Stop") {
        var stop = $('#stop');
        stop.prop('disabled', true);
        pw = $('#pwstop').val();
        obj = {
            auth: pw
        };
        socket.emit('stop', { obj: obj});
    } else if (button.value === "Start Second Round") {
        var round2 = $('#Round2');
        round2.prop('disabled', true);
        pw = $('#pwRound2').val();
        obj = {
            auth: pw
        };
        socket.emit('newRound', { obj: obj});
    } else if (button.value === "Adjust") {
        var adjust = $('#adjust');
        adjust.prop('disabled', true);
        pw = $('#pwAdjust').val();
        var t1 = $('#T1Adjust').val();
        var t2 = $('#T2Adjust').val();
        var reason = $('#reason').val();
        obj = {
            auth: pw,
            t1: t1,
            t2: t2,
            reason: reason
        };
        socket.emit('adjust', { obj: obj});
    }
    return false;
}

$(document).on('click', '#weaponRule li a', function () {
    var value = $(this).parent().attr('value');
    console.log(value);
    if (value === "classThunderdome" || value === "classEmerald" || value === "classOvO") {
        console.log('asd');
        var pw = $('#password').val();
        var obj = {
            auth: pw,
            ruleset: value
        };
        socket.emit('classDefault', { obj : obj });
    } else if (value === "weaponThunderdome" || value === "weaponEmerald" || value === "weaponOvO") {
        console.log('asd');
        pw = $('#password').val();
        obj = {
            auth: pw,
            ruleset: value
        };
        socket.emit('weaponDefault', { obj : obj });
    }
});

function valueChange(button) {
    if (button.value === "Save weapon changes (ensure password is entered)") {

    } else if (button.value === "Save class changes (ensure password is entered)") {

    }
}


socket.on('connect', function() {
    socket.on ('redirect', function() {
    //redirect to index.hbs
        console.log('Session started, redirecting to index.hbs');
        window.location.replace("/");
    });
});

socket.emit('backchat', { obj: 'Admin - Web Connection' });