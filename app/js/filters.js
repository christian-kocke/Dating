'use strict';

/* Filters */

var datingFilter = angular.module('datingFilters',[]);

datingFilter.filter('capitalize', function() {
  return function(input, scope) {
    if (input != null)
    input = input.toLowerCase();
    return input.substring(0,1).toUpperCase()+input.substring(1);
  }
});