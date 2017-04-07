/**
 * Created by dylancross on 5/04/17.
 */
const app = require('./app.js'),
    team     = require('./team.js'),
    password = require('./password.js'),
    ps2ws    = require('./ps2ws.js'),
    items     = require('./items.js');

let running = false; // stores whether a match is running or not

module.exports = {
    init: function(io) {

        io.on('connection', function (sock) {

            sock.on('backchat', function () {
                const t1 = team.getT1(),
                    t2 = team.getT2();
                send('teams', { teamOne: t1, teamTwo: t2});
            });

            sock.on('start', function (data) {
                send('redirect', '');
                const event = data.obj;
                if (event.auth === password.KEY) {
                    if ((event.hasOwnProperty('teamOne')) && (event.hasOwnProperty('teamTwo'))) {
                        if (running !== true) {
                            app.start(event.teamOne, event.teamTwo).then(function () {
                                console.log('Admin entered a start match command involving: ' + event.teamOne + ' ' + event.teamTwo);
                            }).catch(function (err) {
                                console.error("Failed to start match between " + event.teamOne + ' ' + event.teamTwo);
                                console.error(err);
                            });
                        }
                        else {
                            console.error('Admin entered a start match command involving: ' + event.teamOne + ' ' + event.teamTwo + ' But a match is already running');
                        }
                    } else {
                        console.error('No data sent: ' + event.teamOne + ' ' + event.teamTwo);
                    }
                }
            });

            sock.on('newRound', function (data) {
                send('redirect', '');
                const event = data.obj;
                if (event.auth === password.KEY) {
                    if (running !== true) {
                        console.log('Admin entered New Round command, new round starting: ' + data);
                        ps2ws.createStream();
                        running = true;
                    }
                    else {
                        console.error('Admin entered New Round command, but a match is already running');
                    }
                }
            });

            sock.on('stop', function (data) {
                send('redirect', '');
                const event = data.obj;
                if (event.auth === password.KEY) {
                    console.log('Admin entered Stop command, match stopping: ' + data);
                    ps2ws.stopTheMatch();
                }
            });

            sock.on('adjust', function (data) {
                send('redirect', '');
                const event = data.obj;
                if (event.auth === password.KEY) {
                    console.log('Admin adjusted score: ' + data);
                    team.adjustScore(event.t1, event.t2, event.reason);
                }
            });

            sock.on('weaponDefault', function (data) {
                send('redirect', '');
                const event = data.obj;
                if (event.auth === password.KEY && running === false) {
                    if (event.ruleset === "weaponThunderdome") { items.updateCategoryMap(0);  }
                    if (event.ruleset === "weaponEmerald") { items.updateCategoryMap(1); }
                    if (event.ruleset === "weaponOvO") { items.updateCategoryMap(2); }
                    console.log('Admin set default weapon rules: ' + data);
                }
            });

            sock.on('classDefault', function (data) {
                send('redirect', '');
                const event = data.obj;
                if (event.auth === password.KEY && running === false) {
                    if (event.ruleset === "classThunderdome") { ps2ws.updatePointMap(0); }
                    if (event.ruleset === "classEmerald") { ps2ws.updatePointMap(1); }
                    if (event.ruleset === "classOvO") { ps2ws.updatePointMap(2); }
                    console.log('Admin set default class rules: ' + data);
                }
            });

            sock.on('weaponUpdate', function (data) {
                send('redirect', '');
                const event = data.obj;
                if (event.auth === password.KEY && running === false) {
                    console.log('Admin updated weapon rules ' + data);
                    items.individualCategoryUpdate(event);
                }
            });

            sock.on('classUpdate', function (data) {
                send('redirect', '');
                const event = data.obj;
                if (event.auth === password.KEY && running === false) {
                    console.log('Admin updated class rules: ' + data);
                    ps2ws.individualPointUpdate(event);
                }
            });
        });

        function send(name, obj) {
            io.emit(name, obj);
        }

    },
    sendData : function (name, obj, io) {
        io.emit(name, obj);
    },
    setRunning : function (run) {
        running = run;
    },
};