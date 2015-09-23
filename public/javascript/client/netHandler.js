'use strict';

/**
 * @author Elmario Husha
 * @name CubeWars
 * @package MSc Computer Science - Project
 */

var NetHandler = function() {
	this.init();
};

NetHandler.prototype = {
	init: function() {
		// Load up socket.io
	},

	connect: function(cb) {
		var s = io.connect('http://localhost:8000');
		this.connection = s;
		cb(this.connection);
	}
};