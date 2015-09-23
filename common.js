'use strict';

/**
 * @author Elmario Husha
 * @name CubeWars
 * @package MSc Computer Science - Project
 */

var mysql  = require('mysql');
var crypto = require('crypto');

/**
 * Common Module
 * @module Server/Common
 */
define(['config'], function(config) {
    /**
     * Common Module
     * @alias module:Server/Common
     */
    var Common = {
        /**
         * Create SHA512 Hash
         * @param  {String} string String to hash
         * @return {String}        Hash String
         */
        createSha512Hash: function(string) {
            return crypto.createHmac('sha512', config.keys.salt).update(string.toString()).digest('hex');
        },

        /**
         * Create MD5 Hash
         * @param  {String} string String to hash
         * @return {String}        Hash String
         */
        createMd5Hash: function(string) {
            return crypto.createHash('md5').update(string.toString()).digest('hex');
        },

        /**
         * Database Object
         * @type {Object}
         */
        db: {
            /**
             * Connect to a database
             * @param  {String} name Database name
             * @return {Object}      Connection Instance
             */
            connect: function(name) {
                if(this.connection) {
                    return this.connection;
                }
                var data = config.db[name];
                var connection = mysql.createConnection({
                    host: data.hostname,
                    user: data.username,
                    password: data.password,
                    database: data.database
                });

                connection.connect(function(err) {
                    if(err) {
                        console.log(err);
                    }
                });

                connection.on('error', function(err) {
                    console.log('MYSQL - re-connecting lost connection: ' + err.stack);
                    connection = mysql.createConnection(database.config);
                    connection.connect();
                });

                this.connection = connection;
                return this.connection;
            },

            /**
             * Disconnect from all connections
             */
            disconnect: function() {
                this.connection.end(function(err) {
                    if(err) {
                        console.log(err);
                    }
                });
            }

        }
    };
    return Common;
});