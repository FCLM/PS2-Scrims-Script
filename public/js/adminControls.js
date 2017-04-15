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
    if (value === "weaponThunderdome" || value === "weaponEmerald" || value === "weaponOvO") {
        var pw = $('#password').val();
        var obj = {
            auth: pw,
            ruleset: value
        };
        socket.emit('weaponDefault', { obj : obj });
    }
});

$(document).on('click', '#classRule li a', function () {
    var value = $(this).parent().attr('value');
    console.log(value);
    if (value === "classThunderdome" || value === "classEmerald" || value === "classOvO") {
        var pw = $('#password').val();
        var obj = {
            auth: pw,
            ruleset: value
        };
        socket.emit('classDefault', { obj : obj });
    }
});

function valueChange(button) {
    if (button.value === "Save weapon changes (ensure password is entered)") {
        var obj = {
            auth : $('#password').val(),
            item0: $('#item0').val(),
            item2: $('#item2').val(),
            item3: $('#item3').val(),
            item4: $('#item4').val(),
            item5: $('#item5').val(),
            item6: $('#item6').val(),
            item7: $('#item7').val(),
            item8: $('#item8').val(),
            item9: $('#item9').val(),
            item10: $('#item10').val(),
            item11: $('#item11').val(),
            item12: $('#item12').val(),
            item13: $('#item13').val(),
            item14: $('#item14').val(),
            item15: $('#item15').val(),
            item16: $('#item16').val(),
            item17: $('#item17').val(),
            item18: $('#item18').val(),
            item19: $('#item19').val(),
            item20: $('#item20').val(),
            item21: $('#item21').val(),
            item22: $('#item22').val(),
            item23: $('#item23').val(),
            item24: $('#item24').val(),
            item100: $('#item100').val(),
            item101: $('#item101').val(),
            item102: $('#item102').val(),
            item104: $('#item104').val(),
            item109: $('#item109').val(),
            item110: $('#item110').val(),
            item111: $('#item111').val(),
            item112: $('#item112').val(),
            item113: $('#item113').val(),
            item114: $('#item114').val(),
            item115: $('#item115').val(),
            item116: $('#item116').val(),
            item117: $('#item117').val(),
            item118: $('#item118').val(),
            item119: $('#item119').val(),
            item120: $('#item120').val(),
            item121: $('#item121').val(),
            item122: $('#item122').val(),
            item123: $('#item123').val(),
            item124: $('#item124').val(),
            item125: $('#item125').val(),
            item126: $('#item126').val(),
            item127: $('#item127').val(),
            item128: $('#item128').val(),
            item129: $('#item129').val(),
            item130: $('#item130').val(),
            item131: $('#item131').val(),
            item132: $('#item132').val(),
            item139: $('#item139').val(),
            item147: $('#item147').val()
        };
        socket.emit('weaponUpdate', { obj : obj });
    } else if (button.value === "Save class changes (ensure password is entered)") {
        var obj = {
            auth: $('#password').val(),
            class0 : $('#class0').val(),
            class1 : $('#class1').val(),
            class11 : $('#class11').val(),
            class12 : $('#class12').val(),
            class13 : $('#class13').val(),
            class21 : $('#class21').val(),
            class22 : $('#class22').val(),
            class23 : $('#class23').val()
        };
        socket.emit('classUpdate', { obj : obj });
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
function checkAPI() {
    $.ajax({
        url: "http://census.daybreakgames.com/get/ps2:v2/world/?c:limit=100",
        dataType: 'jsonp'
    }).done(function (data) {
        if (data.error) {
            $('<p>' + "API OFFLINE" + '</p>').appendTo($(apiErrors));
        } else {
           // Jaeger Online Status
            if (data.world_list[0].state !== "online" && data.world_list[0].state !== "locked") {
                $('<p>' + data.world_list[0].name.en + " : " + data.world_list[0].state + '</p>').appendTo($(apiErrors));
            }
            // Briggs Online Status
            if (data.world_list[1].state !== "online") {
                $('<p>' + data.world_list[1].name.en + " : " + data.world_list[1].state + '</p>').appendTo($(apiErrors));
            }
            // Emerald Online Status
            if (data.world_list[2].state !== "online") {
                $('<p>' + data.world_list[2].name.en + " : " + data.world_list[2].state + '</p>').appendTo($(apiErrors));
            }
            // Cobalt Online Status
            if (data.world_list[3].state !== "online") {
                $('<p>' + data.world_list[3].name.en + " : " + data.world_list[3].state + '</p>').appendTo($(apiErrors));
            }
            // Connery Online Status
            if (data.world_list[4].state !== "online") {
                $('<p>' + data.world_list[4].name.en + " : " + data.world_list[4].state + '</p>').appendTo($(apiErrors));
            }
            // Miller Online Status
            if (data.world_list[5].state !== "online") {
                $('<p>' + data.world_list[5].name.en + " : " + data.world_list[5].state + '</p>').appendTo($(apiErrors));
            }
        }
    });
}

window.onload = checkAPI();