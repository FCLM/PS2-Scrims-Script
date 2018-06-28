const express       = require('express'),
    path          = require('path'),
    favicon       = require('serve-favicon'),
    logger        = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    http          = require('http'),
    socket_io     = require('socket.io');

const ps2ws         = require('./ps2ws.js'),
    teams         = require('./outfit.js'),
    items         = require('./items.js'),
    routes        = require('./routes/index.js'),
    adminControls = require('./routes/admin.js'),
    rules         = require('./routes/rules.js'),
    playerAlias   = require('./routes/alias.js'),
    api_key       = require('./api_key.js'),
    password      = require('./password.js'),
    team          = require('./team.js'),
    overlay       = require('./overlay.js');

const app = express();
const io  = socket_io();
app.io    = io;

let sock = require('./socket.js');
sock.init(io);

// send through the io data and then push the name and object to connected clients
function send(name, obj) {
    sock.sendData(name, obj, io);
}

overlay.initialise();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
app.use(express.static(__dirname + '/public'));

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/admin', adminControls);
app.use('/rules', rules);
app.use('/alias', playerAlias);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
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

async function start(one, two) {
    let oneObj = await teams.fetchTeamData(one).catch(function (err) {
        console.log("Error fetching data for team one: " + one);
        console.error(err);
        // Failure means match should not go ahead so return (exit function)
        return 0;
    });
    let twoObj = await teams.fetchTeamData(two).catch(function (err) {
        console.log("Error fetching data for team two: " + two);
        console.error(err);
        // Failure means match should not go ahead so return (exit function)
        return 0;
    });
    ps2ws.startUp(oneObj, twoObj);
}

module.exports = app;
exports.start  = start;
exports.send   = send;