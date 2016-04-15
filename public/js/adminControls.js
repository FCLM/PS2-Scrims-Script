/**
 * Created by Dylan on 15-Apr-16.
 */
var socket = io();
var form = document.getElementById('start');
document.addEventListener('submit', function(e) {
    e.preventDefault();
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
});
socket.on('connect', function() {
    socket.on ('redirect', function() {
    //redirect to index.html
        console.log('Session started, redirecting to index.html');
        window.location.replace("localhost:3001");
    });
});
socket.emit('backchat', { obj: 'Admin - Web Connection' });