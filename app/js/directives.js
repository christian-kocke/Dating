'use strict';

/* Directives */

var newsDirectives = angular.module('newsDirectives', []);

newsDirectives.directive('loginDialog', function (AUTH_EVENTS) {
	return {
		restrict: 'A',
		template: '<div ng-if="visible" ng-include="\'login.html\'">',
		link: function (scope) {
			var showDialog = function () {
				scope.visible = true;
			};

			scope.visible = false;
			scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
			scope.$on(AUTH_EVENTS.sessionTimeout, showDialog);
		}
	};
});

newsDirectives.directive('passwordMatch', function () {
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


newsDirectives.directive('passwordCheck', function ($q, ValidationService) {
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
});

newsDirectives.directive('emailCheck', function ($q, ValidationService) {
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
});

newsDirectives.directive('focus', function ($timeout) {
	return {
		restrict: 'A',
		link: function (scope, elm, attrs, ctrl) {
			scope.$watch(scope.getState, function (value) {
				if(value) {
					$timeout(function() {
						elm[0].focus();
					});
				}
			});
		}
	};
});


