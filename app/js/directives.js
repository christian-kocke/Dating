'use strict';

/* Directives */

var datingDirective = angular.module('datingDirectives', []);

datingDirective.directive('passwordMatch', function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, elm, attrs, ctrl) {
			ctrl.$validators.passwordmatch = function (modelValue, viewValue) {
				var password = attrs.passwordMatch;
				if(password) {
					if(password === modelValue) {
						return true;
					}
				}
				return false;
			}
		}
	};
});


datingDirective.directive('passwordCheck',['$q','ValidationService', function ($q, ValidationService) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, elm, attrs, ctrl) {
			ctrl.$asyncValidators.passwordcheck = function (modelValue, viewValue) {

				var def = $q.defer();

				if(modelValue) {
					ValidationService.checkPassword({password : modelValue}).then(function (res) {
						if(res) {
							def.resolve();
						}else{
							def.reject();
						}
					});
				}else{
					def.reject();
				}

				return def.promise;
			}
		}
	};
}]);

datingDirective.directive('emailCheck',['$q','ValidationService', function ($q, ValidationService) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, elm, attrs, ctrl) {
			ctrl.$asyncValidators.emailcheck = function (modelValue, viewValue) {
				var def = $q.defer();

				if(modelValue) {
					ValidationService.checkEmail({email : modelValue}).then(function (res) {
						if(!parseInt(res)) {
							def.resolve();
						}else{
							def.reject();
						}
					});
				}else{
					def.reject();
				}

				return def.promise;
			}
		}
	};
}]);

datingDirective.directive('dropzone', ['$rootScope', 'USER_EVENTS', function ($rootScope, USER_EVENTS) {
	return function (scope, element, attrs, ctrl) {

		var config, dropzone;

		config = scope[attrs.dropzone];

		dropzone = new Dropzone(element[0], config.options);

		// bind the given event handlers
		angular.forEach(config.eventHandlers, function (handler, event) {
			dropzone.on(event, handler);
		});
	};	
}]);

datingDirective.directive('geocodeCheck',['$q', function ($q) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, elm, attrs, ctrl) {
			ctrl.$asyncValidators.geocodecheck = function (modelValue, viewValue) {

				var def = $q.defer();

				scope.geocoder.geocode({'address': modelValue}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if(results[0].partial_match || results.length != 1) {
							def.reject();
						} else {
							def.resolve();
						}
					} else {
						def.reject();
					}
				});

				return def.promise;
			}
		}
	};
}]);
