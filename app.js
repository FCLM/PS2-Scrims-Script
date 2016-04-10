var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var prequest = require('prequest');
var Q = require('q');

var ps2ws = require('./ps2ws.js');
var teams = require('./teams.js');
var routes = require('./routes/index');
var users = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

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
  res.render('error', {
    message: err.message,
    error: {}
  });
});


function start(one, two, f) {
  //match variables
  var teamOneTag = one,
      teamTwoTag = two,
      facility = f;

  var response = Q.defer();
  var teamOneObject, teamTwoObject;
  var promises = []
  promises.push(teams.fetchTeamData(teamOneTag));
  promises.push(teams.fetchTeamData(teamTwoTag));

  Q.allSettled(promises).then(function (results) {
    teamOneObject = results[0].value;
    teamTwoObject = results[1].value;
    console.log(teamOneObject.name + '\t\t' + teamOneObject.outfit_id + '\n' + teamTwoObject.name + '\t\t' + teamTwoObject.outfit_id);
    ps2ws.startUp(teamOneObject, teamTwoObject, facility);
    return response.promise;
  });
  }

module.exports = app;

start('Flcm', 'Rsnc', '202');