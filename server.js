'use strict';

/**
 * @file World Server
 * @author Elmario Husha
 * @name CubeWars - Client Server
 * @package MSc Computer Science - Project
 */

/**
 * External Modules
 */
var http = require('http');
var flash = require('connect-flash');
var validator = require('express-validator');
var gzippo = require('gzippo');
var express = require('express');

var RedisStore = require('connect-redis')(express)
var sessionStore = new RedisStore();
var fs = require('fs');

/**
 * Server Module
 * @module Server
 */
define(['config', 'common', 'middleware/local', 'middleware/auth'], function(config, common, local, auth) {
    /**
     * Database Connections
     */

    var db = common.db.connect('main');
    /**
     * Our main world server module
     * @constructor
     * @alias module:Server
     */
    var Server = function() {
        this._rstore  = require('socket.io/lib/stores/redis');
        this._server  = express();
    };

    /**
     * Our World Server
     * @type {Object}
     */
    Server.prototype = {
        /**
         * Basic Startup routine
         * @param  {Object} Server Paramms
         */
        init: function(params) {
            this.params = params || {};
            this.setupServer();
            this.startServer();
            this.initRoutes();
        },

        /**
         * Initialise modules
         */
        setupServer: function() {
            var params = this.params;
            this._server.configure(function() {
                this.set('port', params.port);
                this.set('views', config.client.express.viewFolder);
                this.set('view engine', config.client.express.viewEngine);

                this.use(express.cookieParser());
                // this.use(express.favicon(config.client.express.favicon));
                this.use(express.logger('dev'));
                this.use(flash());
                this.use(express.bodyParser());
                this.use(validator);
                this.use(express.methodOverride());
                this.use(express.cookieParser(config.keys.cookie));

                this.use(
                    express.session ({
                        key: 'CubeWars',
                        secret: config.keys.session,
                        store: sessionStore
                    })
                );

                this.use(this.router);
                this.use(gzippo.staticGzip(config.client.express.publicFolder));
            });

            this._server.configure('development', function() {
                this.use(express.errorHandler());
            });
        },

        /**
         * Start HTTP Listener
         */
        startServer: function() {
            var _this = this;
            this.client = http.createServer(this._server).listen(this._server.get('port'), function() {
                console.log('\nCubeWars client server instance started [' + _this._server.get('port') + ']');
            });
        },

        /**
         * Initialise routes
         */
        initRoutes: function() {
            var _this = this;

            this._server.get('/', function(req, res, next) {
                res.redirect('/login');
            });

            this._server.get('/login', [local], function(req, res, next) {
                if(req.session.account) {
                    res.redirect('/client');
                }
                res.render('login', {
                    title: 'Login'
                });
            });

            this._server.post('/login', [local], function(req, res) {
                req.assert('loginEmailAddress', 'Please enter an email address').notEmpty().isEmail();
                req.assert('loginPassword', 'Please enter a password').notEmpty();
                req.sanitize('loginEmailAddress').xss();
                req.sanitize('loginPassword').xss();

                var errors = req.validationErrors();
                if(!errors) {
                    var queryString = 'SELECT * FROM players WHERE emailAddress = ? AND password = ?';
                    var queryValues = [
                        common.createSha512Hash(req.body.loginEmailAddress),
                        common.createSha512Hash(req.body.loginPassword)
                    ];

                    db.query(queryString, queryValues, function(err, result) {
                        if (result[0]) {
                            req.session.account = result[0];
                            res.redirect('/client');
                        } else {
                            req.flash('errorMessage', 'Invalid email address/password combination');
                            res.redirect('/login');
                        }
                    });
                } else {
                    req.flash('errorMessage', errors[0].msg);
                    res.redirect('/login');
                }
            });

            this._server.get('/logout', function(req, res) {
                req.session.destroy();
                res.redirect('/');
            });

            this._server.get('/signup', [local], function(req, res) {
                res.redirect('/signup/details');
            });

            this._server.get('/signup/:step', [local], function(req, res) {
                res.render('signup/' + req.params.step, {
                    title: 'Signup'
                });
            });

            this._server.post('/signup/details', [local], function(req, res) {
                req.assert('signupEmailAddress', 'Please enter a valid email address').notEmpty().isEmail();
                req.assert('signupUsername', 'Please enter a valid userane, 3-15 characters').notEmpty().len(3, 15);
                req.assert('signupPassword', 'Please enter a valid password, 3-30 characters').notEmpty().len(3, 50);

                req.sanitize('signupEmailAddress').xss();
                req.sanitize('signupPassword').xss();
                req.sanitize('signupUsername').xss();

                var errors = req.validationErrors();
                var queryString = 'SELECT playerId FROM players WHERE emailAddress = ? OR username = ?';
                var queryValues = [
                    req.body.signupEmailAddress,
                    req.body.signupUsername
                ];

                if (!errors) {
                    db.query(queryString, queryValues, function(err, result) {
                        if (result[0]) {
                            req.flash('errorMessage', 'Email address or username already in use');
                            res.redirect('/signup/details');
                        } else {
                            var queryString = 'INSERT INTO players(playerId, emailAddress, password, username, registrationTimestamp, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, rotationW) VALUES(NULL, ?, ?, ?, NOW(), 100, 225, 100, 0.00000006939708, -0.00066954479553, 0.00000005582357, 0.99999952316284)';
                            var queryValues = [
                                common.createSha512Hash(req.body.signupEmailAddress),
                                common.createSha512Hash(req.body.signupPassword),
                                req.body.signupUsername
                            ];

                            db.query(queryString, queryValues, function(err, result) {
                                var queryString = "INSERT INTO attributes(playerId) VALUES(?)";
                                var queryValues = [result.insertId];
                                db.query(queryString, queryValues, function(err, result) {
                                    if(err) {
                                        req.flash('errorMessage', 'We were unable to create your account due to an error, please try again later');
                                    } else {
                                        req.flash('successMessage', 'Your game account has been created!');
                                        res.redirect('/login');                    
                                    }
                                });
                            });
                        }
                    });
                } else {
                    req.flash('errorMessage', errors[0].msg);
                    res.redirect('/signup/details');
                }
            });

            this._server.get('/client', [local, auth], function(req, res, next) {
                res.render('client/index', {
                  title: 'Game'
                });
            });
        }
    };

    return new Server();
});
