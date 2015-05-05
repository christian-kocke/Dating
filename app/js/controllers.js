'use strict';

/* Controllers */

var datingController = angular.module('datingControllers', ['angularFileUpload', 'ngToast']);


datingController.controller('ApplicationController', function (ngToast, $scope, USER_ROLES, AuthService, $location, $log, Session, UserService, $rootScope, $route, USER_EVENTS, AUTH_EVENTS, FacebookAuthService) {

	$scope.userRoles = USER_ROLES;
	$scope.isAuthorized = AuthService.isAuthorized;

	// Logout user
	$scope.logout = function () {
		AuthService.logout().then(function (res) {
			$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
			$location.path('/');
		});
		FacebookAuthService.logout();
	}; // End logout()


	$scope.deleteAccount = function () {
		UserService.destroy($rootScope.currentUser.id).then(function (res) {
			$rootScope.currentUser = null;
			Session.destroy();
			$route.reload();
			$rootScope.$broadcast(USER_EVENTS.deleteSuccess);
		}, function () {
			$rootScope.$broadcast(USER_EVENTS.deleteFailed);
		});
	};

});// End ApplicationController

datingController.controller('ProfilCtrl', function ($scope, $log, $upload, FileService, $rootScope, FILE_EVENTS, RESOURCE, ProfilService) {

	$scope.loadProfil = function () {
		ProfilService.get($rootScope.currentUser).then(function (profil) {
			$rootScope.currentProfil = profil;
		}, function () {
			$log.log("info user non-loadées");
		});
	};
	
	// Waiting for a Drop
	$scope.$watch('files', function () {
		$scope.upload();
	});

	// When an element is dropped
	$scope.upload = function () {
		angular.forEach(FileService.update($scope.files, RESOURCE.user+'/setPicture'), function (promise) {
			promise.then(function (res) {
				$rootScope.currentProfil.profil_path = res.data + '?decache=' + Math.random();
				$rootScope.$broadcast(FILE_EVENTS.uploadSuccess);
			}, function () {
				$rootScope.$broadcast(FILE_EVENTS.updateFailed);
			});
		});

	};// End upload()

}); // ./End ProfilCtrl

datingController.controller('RegistrarCtrl', function (UserService, $rootScope, $scope, $log, $route, $location, USER_EVENTS, $routeParams) {

	$scope.submitted = false;
	$scope.loading = false;
	$scope.activated = false;

	$scope.register = function (user) {
		$scope.loading = true;
		user.dob = user.year+"-"+user.month+"-"+user.day;
		UserService.create(user).then(function (res) {
			if(parseInt(res)){
				$rootScope.$broadcast(USER_EVENTS.registrationSuccess);
				$scope.user = {};
				$scope.signUpForm.$setPristine();
				$scope.submitted = true;
			}else{
				$rootScope.$broadcast(USER_EVENTS.registrationFailed);
			}
		}, function () {
			$rootScope.$broadcast(USER_EVENTS.registrationFailed);
		}).finally(function () {
			$scope.loading = false;
		});
	};

	$scope.activate = function () {
		if($routeParams.token.length === 20) {
			UserService.activate($routeParams).then(function (res) {
				if(res) {
					$scope.activated = true;
				}
			});
		}
	}

});

datingController.controller('ResetPasswordCtrl', function ($rootScope, $scope, $location, $routeParams, ResetService, USER_EVENTS, AuthService) {

	$scope.sendEmail = function (email) {
		$scope.loading = true;
		ResetService.request(email).then(function (res) {
			if(parseInt(res)) {
				$rootScope.$broadcast(USER_EVENTS.emailSuccess);
				$scope.sent = true;
			} else {
				$rootScope.$broadcast(USER_EVENTS.emailFailed);
			}
		}, function () {
			$rootScope.$broadcast(USER_EVENTS.emailFailed);
			$scope.error = true;
		}).finally(function () {
			$scope.loading = false;
		});
	};

	$scope.resetPassword = function (credentials) {
		credentials.token = $routeParams.token;
		ResetService.reset(credentials).then(function (res) {
			if(parseInt(res) === 1) {
				AuthService.retrieveUser().then(function (res) {
					$rootScope.currentUser = res;
					$rootScope.$broadcast(USER_EVENTS.resetSuccess);
					$location.path('/');
				});
			} else if(parseInt(res) === 2) {
				$rootScope.$broadcast(USER_EVENTS.resetExpired);
			} else {
				$rootScope.$broadcast(USER_EVENTS.resetFailed);
			}
		}, function () {
			$rootScope.$broadcast(USER_EVENTS.resetFailed);
		});
	};
});


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

	$scope.facebookLogout = function () {
		FacebookAuthService.logout().then(function (res) {
			console.log(res);
		});
	}

}); // End AuthCtrl