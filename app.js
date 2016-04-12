var express       = require('express'),
    path          = require('path'),
    favicon       = require('serve-favicon'),
    logger        = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    Q             = require('q'),
    nunjucks      = require('nunjucks'),
    http          = require('http');

var ps2ws   = require('./ps2ws.js'),
    teams   = require('./teams.js'),
    routes  = require('./routes/index'),
    users   = require('./routes/users'),
    config  = require('./config'),
    api_key = require('./api_key');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.html'); // changed from hbs to .html
app.use(express.static(__dirname + '/public')); // code from killfeed.js

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  //res.render('error', {
  //  message: err.message,
  //  error: {}
  //});
});

// Killfeed.js code start

app.set('port', 3001);

nunjucks.configure('views', {
  autoescape: true,
  express: app
});

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

//end killfeed.js code

function start(one, two, f) {
  //match variables
  var teamOneTag = one,
      teamTwoTag = two,
      facility = f;

  var response = Q.defer();
  var teamOneObject, teamTwoObject;
  var promises = [];
  promises.push(teams.fetchTeamData(teamOneTag));
  promises.push(teams.fetchTeamData(teamTwoTag));

  Q.allSettled(promises).then(function (results) {
    if (config.DEBUG) {
      console.log('T1 - ' + config.debug.team1);
      console.log('T2 - ' + config.debug.team2);
      teamOneObject = JSON.parse(config.debug.team1);
      teamTwoObject = JSON.parse(config.debug.team2);
    } else {
      console.log('T1 - ' + JSON.stringify(results[0].value));
      console.log('T2 - ' + JSON.stringify(results[1].value));
      teamOneObject = results[0].value;
      teamTwoObject = results[1].value;
    }
    ps2ws.startUp(teamOneObject, teamTwoObject, facility);
    return response.promise;
  });
}

module.exports = app;

//start('7ROI', 'HBSS', '202');
start(config.config.team1, config.config.team2, config.config.base);