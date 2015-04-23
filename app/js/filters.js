'use strict';

/* Filters */

var newsFilters = angular.module('newsFilters',[]);

newsFilters.filter('preview', function() {
    return function(input, scope) {
        return input.substring(0,250)+"...";
    }
});