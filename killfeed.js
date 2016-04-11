/**
 * guardian_server.js
 * =====================================================================================================================
 * Main node script for the Guardian
 * Functions:
 *  - Poll database for duress, welfare and location without forwarding_date and submit to SamsNode
 *  - Also stream to data without a forwarding_date to a web page (live queue)
 *  - Accept duress and welfare data streams from SamsNode and update database
 */


var bodyParser = require('body-parser'),
  express    = require('express'),
  http       = require('http'),
  nunjucks   = require('nunjucks'),
  request    = require('request');

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('port', 3001);

nunjucks.configure('views', {
  autoescape: true,
  express: app
});
app.set('view engine', '.html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// Render main html
app.get('/', function(req, res) {
  res.render('killfeed', {title: 'Killfeed'});
});


console.log('Starting server...');
var server = http.createServer(app).listen(app.get('port'));
var io = require('socket.io').listen(server);
io.on('connection', function(sock) {
  sock.on('backchat', function (data) {
    console.log(data);
  });
});

var count = 0;
setInterval(function () {
  count++;
  var obj = {
    winner: 'mono',
    winner_faction: 2,
    loser: 'spoodles',
    loser_faction: 1,
    weapon: 'Serpent',
    image: '7214.png',
    points: Math.floor(Math.random() * 5) ,
    time: (count * 1000)
  };
  io.emit('killfeed', {obj: obj});
}, 2000);

console.log('Listening on port %d', server.address().port);


module.exports = app;