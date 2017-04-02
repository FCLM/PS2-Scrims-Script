var express       = require('express'),
    path          = require('path'),
    favicon       = require('serve-favicon'),
    logger        = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    Q             = require('q'),
    nunjucks      = require('nunjucks'),
    http          = require('http');

var ps2ws         = require('./ps2ws.js'),
    teams         = require('./teams.js'),
    routes        = require('./routes/index.js'),
    adminControls = require('./routes/admin.js'),
    rules         = require('./routes/rules.js'),
    api_key       = require('./api_key.js'),
    password      = require('./password.js');

//global variable for use in different functions
var teamOneObject, teamTwoObject;
// running variable stores the state of a match (true means a match is in progress) and is used to prevent multiple streams being opened for the same data.
// should prevent the double tracking issues of round 2 of thunderdome.
var running = false;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.html');
app.use(express.static(__dirname + '/public'));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/admin', adminControls);
app.use('/rules', rules);

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
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

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
    if (teamOneObject !== undefined) {
      var teams = {
        teamOne: {
          alias: teamOneObject.alias,
          name: teamOneObject.name,
          faction: teamOneObject.faction
        },
        teamTwo: {
          alias: teamTwoObject.alias,
          name: teamTwoObject.name,
          faction: teamTwoObject.faction
        }
      };
      io.emit('teams', {obj: teams});
      ps2ws.sendScore();
    } else {
      console.log(teamOneObject + '\n' + teamTwoObject);
    }
  });
  sock.on('start', function (data) {
    io.emit('redirect');
    var event = data.obj;
    if (event.auth === password.KEY) {
      if ((event.hasOwnProperty('teamOne')) && (event.hasOwnProperty('teamTwo'))) {
        if (running !== true) {
          start(event.teamOne, event.teamTwo);
          console.log('Admin entered a start match command involving: ' + event.teamOne + ' ' + event.teamTwo);
          running = true;
        }
        else {
          console.error('Admin entered a start match command involving: ' + event.teamOne + ' ' + event.teamTwo + ' But a match is already running');
        }
      } else {
        console.error('No data sent: ' + event.teamOne + ' ' + event.teamTwo);
      }
    }
  });
  sock.on('newRound', function(data) {
    io.emit('redirect');
    var event = data.obj;
    if (event.auth === password.KEY) {
      if (running !== true) {
        console.log('Admin entered New Round command, new round starting: ');
        console.log(data);
        ps2ws.createStream();
        running = true;
      }
      else {
        console.error('Admin entered New Round command, but a match is already running');
      }
    } else {
      console.log(data);
    }
  });
  sock.on('stop', function(data) {
    io.emit('redirect');
    var event = data.obj;
    if (event.auth === password.KEY) {
      console.log('Admin entered Stop command, match stopping: ');
      console.log(data);
      ps2ws.stopTheMatch();
    }
  });
  sock.on('adjust', function(data) {
        io.emit('redirect');
        var event = data.obj;
        if (event.auth === password.KEY) {
            console.log('Admin adjusted score: ');
            console.log(data);
            ps2ws.adjustScore(event.t1, event.t2, event.reason);
        }
  });
});

function matchFinished() {
  // called from ps2ws when a match is finished
  running = false;
}

console.log('Listening on port %d', server.address().port);

function refreshPage() {
  io.emit('refresh');
}

function killfeedEmit(killfeed) {
  io.emit('killfeed', {obj: killfeed});
}

function sendScores(teamOneObject, teamTwoObject) {
  var scoreboard = {
    teamOne: {
      alias : teamOneObject.alias,
      name : teamOneObject.name,
      points : teamOneObject.points,
      netScore : teamOneObject.netScore,
      kills : teamOneObject.kills,
      deaths : teamOneObject.deaths,
      faction : teamOneObject.faction,
      members : []
    },
    teamTwo: {
      alias : teamTwoObject.alias,
      name : teamTwoObject.name,
      points : teamTwoObject.points,
      netScore : teamTwoObject.netScore,
      kills : teamTwoObject.kills,
      deaths : teamTwoObject.deaths,
      faction : teamTwoObject.faction,
      members : []
    }
  };
  for (keys in teamOneObject.members) {
    scoreboard.teamOne.members.push(teamOneObject.members[keys])
  }
  for (keys in teamTwoObject.members) {
    scoreboard.teamTwo.members.push(teamTwoObject.members[keys])
  }
  io.emit('score', {obj: scoreboard});
}

function playerDataT1 (obj) {
  io.emit('playerDataT1', {obj: obj});
}

function playerDataT2 (obj) {
  io.emit('playerDataT2', {obj: obj});
}

function timerEmit (obj) {
  io.emit('time', {obj: obj});
}


function start(one, two) {
  var teamOneTag = one,
      teamTwoTag = two;
  var response = Q.defer();
  var promises = [];
  promises.push(teams.fetchTeamData(teamOneTag));
  promises.push(teams.fetchTeamData(teamTwoTag));
  Q.allSettled(promises).then(function (results) {
      console.log('T1 - ' + JSON.stringify(results[0].value));
      console.log('T2 - ' + JSON.stringify(results[1].value));
      teamOneObject = results[0].value;
      teamTwoObject = results[1].value;
      ps2ws.startUp(teamOneObject, teamTwoObject);
      return response.promise;
  });
}

module.exports        = app;
exports.killfeedEmit  = killfeedEmit;
exports.sendScores    = sendScores;
exports.refreshPage   = refreshPage;
exports.playerDataT1  = playerDataT1;
exports.playerDataT2  = playerDataT2;
exports.timerEmit     = timerEmit;
exports.matchFinished = matchFinished;
