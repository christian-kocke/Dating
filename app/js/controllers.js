'use strict';

/* Controllers */

var datingController = angular.module('datingControllers', ['angularFileUpload', 'ngToast']);

datingController.controller('NavCtrl', function ($scope, $log, $location) {

	$scope.getClass = function(path) {
		return ($location.path() === path) ? "activeLink" : "";
	};
}); // End NavCtrl

datingController.controller('AuthCtrl', function ($scope, $log, $rootScope, $route, $location, AUTH_EVENTS, AuthService, FacebookAuthService, AuthInterceptor) {

	$scope.credentials = {};

	// Authenticate user
	$scope.login = function (credentials) {
		
		AuthService.login(credentials).then(function (user) {
			$rootScope.currentUser = user;
			$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			$route.reload();
		}, function (res) {
			console.log(res);
			res.status = parseInt(res.data)
			AuthInterceptor.responseError(res);
			$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
		});

	}; // End login()

	// Logout user
	$scope.logout = function () {
		AuthService.logout().then(function (res) {
			$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
			$location.path('/');
		});

	}; // End logout()

	$scope.facebookLogout = function () {
		FacebookAuthService.logout().then(function (res) {
			console.log(res);
		});
	}

}); // End AuthCtrl