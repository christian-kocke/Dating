'use strict';

/* Controllers */

var datingController = angular.module('datingControllers', ['angularFileUpload', 'ngToast']);


datingController.controller('ApplicationController',['$scope','USER_ROLES','AuthService','$location','Session','UserService','$rootScope','FacebookAuthService','$window','ToastService', function ($scope, USER_ROLES, AuthService, $location, Session, UserService, $rootScope, FacebookAuthService, $window, ToastService) {

	$scope.userRoles = USER_ROLES;
	$scope.isAuthorized = AuthService.isAuthorized;
	$rootScope.screenSize = "";

	$scope.onload = function() {
		if($window.innerWidth < 768) {
			$rootScope.screenSize = 'mobile';
		} else if($window.innerWidth < 992) {
			$rootScope.screenSize = 'tablet';
		} else if($window.innerWidth < 1200) {
			$rootScope.screenSize = 'medium';
		} else {
			$rootScope.screenSize = 'large'
		}
	}; // End onload()

	$scope.onload();

	// Logout user
	$scope.logout = function () {
		AuthService.logout().then(function (res) {
			ToastService.show('You are logged out !', 'danger');
			$location.path('/');
		});
		FacebookAuthService.logout();
	}; // End logout()


	$scope.deleteAccount = function () {
		UserService.destroy($rootScope.currentUser.id).then(function (res) {
			$rootScope.currentUser = null;
			Session.destroy();
			$location.path('/');
			ToastService.show('Your account has been deleted !', 'success');
		}, function () {
			ToastService.show('Sorry, we were unable to delete your account, please try again !', 'warning');
		});
	}; // End deleteAccount()

}]); // End ApplicationController

datingController.controller('MapCtrl',['$scope','$rootScope','ToastService','MAP_EVENTS','USER_EVENTS','ProfilService', function ($scope, $rootScope, ToastService, MAP_EVENTS, USER_EVENTS, ProfilService) {

	$scope.geocoder;
	$scope.map;
	$scope.loading = false;

	$scope.initialize = function () {
		$scope.geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng($rootScope.currentProfil.location.A, $rootScope.currentProfil.location.F);
		var mapOptions = {
          center: latlng,
          zoom: 11,
          minZoom:10,
          scrollwheel: false,
          draggable: false
        };
		$scope.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		var marker = new google.maps.Marker({
			map: $scope.map,
			position: latlng
		});

		google.maps.event.addListener($scope.map, 'bounds_changed', function() {
			$scope.loading = false;
			$scope.$apply();
		});
	}; // End initialize()

	$scope.$on(USER_EVENTS.profilLoadSucces, function (event) {
		event.currentScope.initialize();
	});


	$scope.codeAddress = function (address) {
		$scope.loading = true;
		$scope.geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				$scope.map.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: $scope.map,
					position: results[0].geometry.location
				});
				ProfilService.update({location: marker.position}).then(function (res) {

				});
			} else {
				$rootScope.$broadcast(MAP_EVENTS.mapError, status);
			}
		});
	}; // End codeAddress()

	$scope.geolocate = function () {
		// Try HTML5 geolocation
		if(navigator.geolocation) {
			$scope.loading = true;
	    	navigator.geolocation.getCurrentPosition(function(position) {
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				var marker = new google.maps.Marker({
					map: $scope.map,
					position: pos
				});

				$scope.map.setCenter(pos);

			}, function(error) {
				$scope.$emit(MAP_EVENTS.geolocationFailed);
			}, {timeout: 5000});

		} else {
			// Browser doesn't support Geolocation
			$rootScope.$broadcast(MAP_EVENTS.geolocationNotSupported);
		}
	};// End geolocate()

}]); // End MapCtrl

datingController.controller('ProfilCtrl',['$scope','$upload','FileService','$rootScope','FILE_EVENTS','USER_EVENTS','RESOURCE','$routeParams','ProfilService','$location', function ($scope, $upload, FileService, $rootScope, FILE_EVENTS, USER_EVENTS, RESOURCE, $routeParams, ProfilService, $location) {

	$scope.activeTab = 'profil';

	$scope.getClass = function (path) {
		return ($scope.activeTab === path) ? "pinkBtnMd" : "";
	}; // End getClass()

	$scope.setClass = function (path) {
		$scope.activeTab = path;
	}; // End setClass()

	$scope.loadProfil = function () {
		ProfilService.show($rootScope.currentUser.id).then(function (profil) {
			profil.location = JSON.parse(profil.location);
			$rootScope.currentProfil = profil;
			$rootScope.$broadcast(USER_EVENTS.profilLoadSucces);
		}, function () {
			$rootScope.$broadcast(USER_EVENTS.profilLoadFailed);
		});
	}; // End loadProfil()
	
	// Waiting for a Drop
	$scope.$watch('profilPicture', function () {
		$scope.upload($scope.profilPicture, RESOURCE.userFiles, '/app/imgDrop/ProfilPictures/', 'user_'+$rootScope.currentUser.id);
	});

	$scope.$watch('photos', function () {
		$scope.upload($scope.photos, RESOURCE.userFiles, '/app/imgDrop/ProfilPictures/', 'user_'+$rootScope.currentUser.id);
	});

	// When an element is dropped
	$scope.upload = function (file, route, path, name) {
		angular.forEach(FileService.upload(file, route, path, name), function (promise) {
			promise.then(function (res) {
				$rootScope.currentProfil.profil_path = res.data + '?decache=' + Math.random();
				$rootScope.$broadcast(FILE_EVENTS.uploadSuccess);
			}, function () {
				$rootScope.$broadcast(FILE_EVENTS.updateFailed);
			});
		});

	}; // End upload()

	$scope.update = function () {
		ProfilService.update().then(function (res) {

		}, function () {

		});
	}; // End update()

}]); // ./End ProfilCtrl

datingController.controller('RegistrarCtrl',['UserService','$rootScope','$scope','$route','$location','USER_EVENTS','$routeParams', function (UserService, $rootScope, $scope, $route, $location, USER_EVENTS, $routeParams) {

	$scope.submitted = false;
	$scope.loading = false;
	$scope.activated = false;

	$scope.register = function (user) {
		$scope.loading = true;
		user.dob = user.year+"-"+user.month+"-"+user.day;
		UserService.create(user).then(function (res) {
			if(parseInt(res)){
				$rootScope.$broadcast(USER_EVENTS.registrationSuccess);
				$scope.submitted = true;
			}else{
				$rootScope.$broadcast(USER_EVENTS.registrationFailed);
			}
		}, function () {
			$rootScope.$broadcast(USER_EVENTS.registrationFailed);
		}).finally(function () {
			$scope.loading = false;
		});
	}; // End register()

	$scope.activate = function () {
		if($routeParams.token.length === 20) {
			UserService.activate($routeParams).then(function (res) {
				if(res) {
					$scope.activated = true;
				}
			});
		}
	}; // End activate()

}]); // End RegistrarCtrl

datingController.controller('ResetPasswordCtrl',['$rootScope','$scope','$location','$routeParams','ResetService','USER_EVENTS','AuthService', function ($rootScope, $scope, $location, $routeParams, ResetService, USER_EVENTS, AuthService) {

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
	}; // End sendEmail()

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
	}; // End resetPassword()
}]); // End ResetPasswordCtrl


datingController.controller('NavCtrl',['$scope','$location', function ($scope, $location) {

	$scope.getClass = function(path) {
		return ($location.path() === path) ? "activeLink" : "";
	}; // End getClass()
}]); // End NavCtrl

datingController.controller('AuthCtrl',['$scope','$rootScope','$route','$location','AUTH_EVENTS','AuthService','FacebookAuthService','AuthInterceptor', function ($scope, $log, $rootScope, $route, $location, AUTH_EVENTS, AuthService, FacebookAuthService, AuthInterceptor) {

	$scope.credentials = {};

	// Authenticate user
	$scope.login = function (credentials) {
		
		AuthService.login(credentials).then(function (user) {
			$rootScope.currentUser = user;
			$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			$route.reload();
		}, function (res) {
			res.status = parseInt(res.data)
			AuthInterceptor.responseError(res);
			$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
		});

	}; // End login()

	$scope.facebookLogout = function () {
		FacebookAuthService.logout().then(function (res) {});
	}; // En facebookLogout()

}]); // End AuthCtrl