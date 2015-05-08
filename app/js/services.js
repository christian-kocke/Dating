'use strict';

/* Services */

var datingService = angular.module('datingServices', ['ngResource']);

datingService.factory('FileService', function ($http, $log, $rootScope, $upload) {

	var fileService = {};

	// When an image is uploaded
	fileService.update = function (files, url, filePath, fileName) {
		
		var promises = [];

		if (files && files.length) {

			for (var i = 0; i < files.length; i++) {
				var file = files[i];

				var promise = $upload.upload({
					url: url,
					headers: {
						name: fileName,
						path: filePath
					},
					file: file
				}).progress(function (evt) {
					var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
				}).success(function (data, status, headers, config) {
					console.log('file ' + config.file.name + ' uploaded. Response: ' + data);
					return data;
				});
				promises.push(promise);
			}
		}
		
		return promises;

	}; // End update()

	return fileService;

}); // End  FileService

datingService.factory('socket', function ($rootScope) {
    var socket = io.connect('http://127.0.0.1:3000/');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});


datingService.factory('ResetService', function ($http, RESOURCE) {
	var resetService = {};

	resetService.request = function (email) {
		return $http
		.post(RESOURCE.resetPassword+'/email', email)
		.then(function (res) {
			return res.data;
		});
	};

	resetService.reset = function (credentials) {
		return $http
		.post(RESOURCE.resetPassword+'/reset', credentials)
		.then(function (res) {
			return res.data;
		});
	};

	return resetService;
});

datingService.factory('ValidationService', function ($http, RESOURCE) {
	var validationService = {};

	validationService.checkEmail = function (email) {
		return $http
		.post(RESOURCE.user+'/validation/email', email)
		.then(function (res) {
			return res.data;
		}, function () {
			return false;
		});
	};

	validationService.checkPassword = function (password) {
		return $http
		.post(RESOURCE.user+'/validation/password', password)
		.then(function (res) {
			return !!res.data;
		}, function () {
			return false;
		});
	};

	return validationService;

});


/*
	Handle basic user lifecycle action. 
	*/
datingService.factory('UserService', function ($http, RESOURCE) {

	var userService = {};

	userService.create = function (user) {
		return $http
		.post(RESOURCE.user, user)
		.then(function (res) {
			return res.data;
		});
	};

	userService.update = function (data, id) {
		return $http
		.put(RESOURCE.user.concat(id), data)
		.then(function (res) {
			return res.data;
		});
	};

	userService.activate = function (token) {
		return $http
		.post(RESOURCE.user+'/activate', token)
		.then(function (res) {
			return res.data;
		});
	};

	userService.destroy = function (id) {
		return $http
		.delete(RESOURCE.user.concat(id))
		.then(function (res) {
			return res.data;
		});
	};

	return userService;
});

datingService.factory('ProfilService', function ($http, RESOURCE, $rootScope) {

	var profilService = {};
	
	profilService.show = function (id) {
		return $http
		.get(RESOURCE.profil+'/'+id)
		.then(function (res) {
			return res.data;
		});
	};

	profilService.update = function (profil) {
		return $http
		.put(RESOURCE.profil+'/'+$rootScope.currentProfil.id, profil)
		.then(function (res) {
			return res.data;
		});
	};

	return profilService;
});

datingService.factory('ToastService', function (ngToast) {
	return {
		show: function (message, type) {
			var aToast = ngToast.create({
                className: type,
                content: message
            });
		}
	};
});

/*
	Handle every aspect of user authentification. 
	*/
datingService.factory('AuthService', function ($http, Session, $log, $rootScope, AuthInterceptor, RESOURCE) {

	var authService = {};

	// Login
	authService.login = function (credentials) {
		console.log(credentials);
		return $http
		.post(RESOURCE.user+'/auth', credentials)
		.then(function (res) {
			console.log(res);
			Session.create(res.data.id, res.data.user.id, res.data.user.role);
			return res.data.user;
		});

	};// End login()

	// Logout
	authService.logout = function () {
		
		return $http
		.get(RESOURCE.user+'/logout')
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
datingService.factory('FacebookAuthService', function ($http, $q, Session, $rootScope) {

	var facebookAuthService = {};

	facebookAuthService.logout = function () {
		var deferred = $q.defer();
		facebookAuthService.authStatus().then(function (response) {
			if(response.status === "connected") {
				FB.logout(function (response) {
					if (!response || response.error) {
		                deferred.reject('Error occured');
		            } else {
		                deferred.resolve(response);
		            }
				});
			}
		});
		return deferred.promise;
	};

	facebookAuthService.retrieveUser = function () {
		var deferred = $q.defer();
		facebookAuthService.authStatus().then(function (auth) {
			if(auth.status === 'connected') {
				FB.api('/me', function (response) {
					if (!response || response.error) {
		                deferred.reject('Error occured');
		            } else {
		            	Session.create(auth.authResponse.accessToken, auth.authResponse.userID, 'client');
		                deferred.resolve(response);
		            }
				});
			} else {
				deferred.reject(auth.status);
			}
		});
		return deferred.promise;
	};

	facebookAuthService.authStatus = function () {
		var deferred = $q.defer();
		FB.getLoginStatus(function (response) {
			if (!response || response.error) {
                deferred.reject('Error occured');
            } else {
                deferred.resolve(response);
            }
		});
		return deferred.promise;
	};

	facebookAuthService.WatchAuthStatusChange = function () {
		FB.Event.subscribe('auth.authResponseChange', function (response) {
			console.log(response);
			if (response.status === 'connected') {
            	facebookAuthService.retrieveUser().then(function (user) {
            		if(user) {
            			$rootScope.currentUser = user;
            			$rootScope.deferredFB.resolve("fb success");
            		} else {
            			$rootScope.deferredFB.reject("fb echec");
            		}
            	});
            } else {
            	$rootScope.deferredFB.reject("fb echec");
            } 
		},  {scope: 'email,user_likes,public_profile', return_scopes: true});
	};

	return facebookAuthService;

});// End FacebookAuthService

datingService.factory('Session', function () {

	var Session = {};

	Session.create = function (sessionId, userId, userRole) {

		Session.id = sessionId;
		Session.userId = userId;
		Session.userRole = userRole;

	}; // End create()

	Session.destroy = function () {

		Session.id = null;
		Session.userId = null;
		Session.userRole = null;

	}; // End destroy()

	return Session;

}); // End Session




datingService.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS, FILE_EVENTS, USER_EVENTS) {

	return {

		responseError: function (response) { 

			$rootScope.$broadcast({
				401: AUTH_EVENTS.notAuthenticated,
				403: AUTH_EVENTS.notAuthorized,
				419: AUTH_EVENTS.sessionTimeout,
				440: AUTH_EVENTS.sessionTimeout,
				441: FILE_EVENTS.uploadFailed,
				442: FILE_EVENTS.getFailed,
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


datingService.factory('AuthResolver', function ($q, $rootScope, $location, $log) {
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


datingService.factory('SessionResolver', function ($q, $rootScope, $location, $log, Session) {
	
	return {
		
		resolve: function () {
			var retrieved = $q.defer();

			$rootScope.deferred.promise.then(function (res) {
				console.log(res);
				retrieved.resolve();
			}, function (res) {
				console.log(res);
				$rootScope.deferredFB.promise.then(function (res) {
					console.log(res);
					retrieved.resolve()
				}, function (res) {
					console.log(res);
					retrieved.reject();
				});
			});
			
			retrieved.promise.finally(function () {
				console.log("retrieved finally");
				console.log(retrieved.promise);
				$rootScope.$broadcast('$routeChangeStart');
			});

			return retrieved.promise;

		}// End resolve

	};// End return

});// End SessionResolver