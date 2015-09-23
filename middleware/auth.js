'use strict';

/**
 * @author Elmario Husha
 * @package CubeWars
*/

define(function() {	
	var auth = function(req, res, next) {
	    if (!req.session.account) {
	        res.redirect('/login');
	    } else {
	        next();
	    }
	}
	return auth;
});