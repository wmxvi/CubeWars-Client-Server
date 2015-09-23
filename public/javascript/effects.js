'use strict';

/**
 * @author Elmario Husha
 * @name CubeWars
 * @package MSc Computer Science - Project
 */

$(function () {
    $('.signupButton').click(function(e) {
        e.preventDefault();
        window.location = '/signup';
    });
});