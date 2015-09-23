'use strict';
var requirejs = require('requirejs');
var assert = require("assert");

requirejs.config({
    baseUrl: '',
    nodeRequire: require
});

// Begin tests

var Common = requirejs('common.js');
describe('Common', function() {

	describe('#createSha512Hash()', function () {
		it('Should return a createSha512Hash hash of our string', function() {
   			var string = 'this is a test';
   			var hash = Common.createSha512Hash(string);
   			assert.equal(true, hash.length > 5);
   		});
	});

	describe('#createMd5Hash()', function () {
		it('Should return a createMd5Hash hash of our string', function() {
   			var string = 'this is a test';
   			var hash = Common.createMd5Hash(string);
   			assert.equal(true, hash.length > 5);
   		});
	});

	describe('#connect()', function () {
		it('Should return a connection instance to our database server', function() {
   			var db = Common.db.connect('main');
   			assert.equal(true, typeof db !== 'undefined');
   		});
	});
});