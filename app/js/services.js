'use strict';

/* Services */

var datingService = angular.module('datingServices', ['ngResource']);

/*
	Handle basic user lifecycle action. 
*/
datingServices.factory('UserService', function ($http, RESOURCE) {

	var userService = {};

	userService.create = function (user) {
		return $http
		.post(RESOURCE.user, user)
		.then(function (res) {
			return res.data;
		});
	}

	userService.update = function (data, id) {
		return $http
		.put(RESOURCE.user.concat(id), data)
		.then(function (res) {
			return res.data;
		});
	};

	userService.activate = function (token) {
		return $http
		.post(RESOURCE.user+'activate', token)
		.then(function (res) {
			return res.data;
		});
	}

	userService.destroy = function (id) {
		return $http
		.delete(RESOURCE.user.concat(id))
		.then(function (res) {
			return res.data;
		});
	};

	return userService;
});

/*
	Handle every aspect of user authentification. 
*/
datingServices.factory('AuthService', function ($http, Session, $log, $rootScope, AuthInterceptor, RESOURCE) {

	var authService = {};

	// Login
	authService.login = function (credentials) {
		return $http
		.post(RESOURCE.user+'login', credentials)
		.then(function (res) {
			console.log(res);
			Session.create(res.data.id, res.data.user.id, res.data.user.role);
			return res.data.user;
		});

	};// End login()

	// Logout
	authService.logout = function () {
		
		return $http
		.get(RESOURCE.user+'logout')
		.then(function (res) {
			$rootScope.currentUser = null;
			Session.destroy();
		});

	};// End logout()


	// Verify authentication
	authService.isAuthenticated = function () {
		return !!Session.userId;

	};// End isAuthenticated()

	// Verify authorisations
	authService.isAuthorized = function (authorizedRoles) {
		
		if (!angular.isArray(authorizedRoles)) {
			authorizedRoles = [authorizedRoles];
		}
		
		return (authService.isAuthenticated() &&
			authorizedRoles.indexOf(Session.userRole) !== -1);

	};// End isAuthorized ()

	// retrieve the current user authenticated
	authService.retrieveUser = function () {
		
		return $http
		.get(RESOURCE.user)
		.then(function (res) {
			if(res.data !== "0"){
				Session.create(res.data.id, res.data.user.id, res.data.user.role);
				return res.data.user;
			} else {
				return null;
			}
		}, function () {
			return null;
		});

	}// End retrieveUser

	return authService;

});// End AuthService


/*
	Handle every aspect of user authentification via the Facebook app. 
*/
datingServices.factory('FacebookAuthService', function () {

	var facebookAuthService = {};

	facebookAuthService.login = function () {

	};

	facebookAuthService.logout = function () {

	};

	facebookAuthService.retrieveUser = function () {

	};

	facebookAuthService.authStatus = function () {

	};

	return facebookAuthService;

});// End FacebookAuthService


datingServices.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS, FILE_EVENTS, ARTICLE_EVENTS, USER_EVENTS) {

	return {

		responseError: function (response) { 

			$rootScope.$broadcast({
				401: AUTH_EVENTS.notAuthenticated,
				403: AUTH_EVENTS.notAuthorized,
				419: AUTH_EVENTS.sessionTimeout,
				440: AUTH_EVENTS.sessionTimeout,
				441: FILE_EVENTS.uploadFailed,
				442: FILE_EVENTS.getFailed,
				450: ARTICLE_EVENTS.postFailed,
				451: ARTICLE_EVENTS.selectFailed,
				452: ARTICLE_EVENTS.deleteFailed,
				460: USER_EVENTS.passwordFailed,
				461: USER_EVENTS.updateFailed,
				462: USER_EVENTS.deleteFailed,
				463: USER_EVENTS.registrationFailed,
				464: USER_EVENTS.activationFailed,
				465: USER_EVENTS.accountNotActivated,
			}[response.status], response);

			return $q.reject(response);
		}// End responseError

	};// End Return

});// End AuthInterceptor


datingServices.factory('AuthResolver', function ($q, $rootScope, $location, $log) {
	return {

		resolve: function (redirectAuth, redirectNotAuth) {

			var deferred = $q.defer();
			var unwatch = $rootScope.$watch('currentUser', function (currentUser) {

				if (angular.isDefined(currentUser)) {
					
					if (currentUser) {
						deferred.resolve(currentUser);
						if(angular.isString(redirectAuth)) $location.path(redirectAuth);
					} else {
						if(angular.isString(redirectNotAuth)) {
							deferred.reject();
							$location.path(redirectNotAuth);
						} else if(redirectNotAuth) {
							$location.path('/');
						}else {
							deferred.resolve();
						}
					}

					unwatch();
				}

			});// End watch()

			return deferred.promise;
		}// End resolve

	};// End return

});// End AuthResolver