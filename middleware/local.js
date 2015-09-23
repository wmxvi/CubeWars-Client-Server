	'use strict';

/**
 * @author Elmario Husha
 * @package CubeWars
*/

define(function() {
	var local = function(req, res, next) {
	    res.locals.errorMessage = req.flash('errorMessage');
	    res.locals.successMessage = req.flash('successMessage');
	    res.locals.session = req.session;
	    next();
	}
	return local;
})