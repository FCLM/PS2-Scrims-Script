/**
 * Created by Dylan on 15-Apr-16.
 */
var socket = io();


var form = document.getElementById('start');

function submitForm (button)
{
    if (button.value == "Track") {
        var tagOne = $("#T1Tag").val();
        var tagTwo = $("#T2Tag").val();
        var pw = $('#pw').val();
        var obj = {
            teamOne : tagOne,
            teamTwo : tagTwo,
            auth: pw
        };
        console.log(obj);
        socket.emit('start', { obj: obj});
    } else if (button.value == "Stop and Restart") {
       socket.emit('stopRestart');
    } else if (button.value == "Start Second Round") {
        socket.emit('newRound');
    }
    return false;
}
document.addEventListener('submit', function(e) {
   
});
socket.on('connect', function() {
    socket.on ('redirect', function() {
    //redirect to index.html
        console.log('Session started, redirecting to index.html');
        window.location.replace("http://localhost:3001");
    });
});
socket.emit('backchat', { obj: 'Admin - Web Connection' });