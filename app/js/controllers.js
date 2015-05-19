'use strict';

/* Controllers */

var datingController = angular.module('datingControllers', ['angularFileUpload', 'ngToast', 'ngCookies']);

datingController.controller('ApplicationController',['$scope','USER_ROLES','AuthService','$location','Session','UserService','$rootScope','FacebookAuthService','$window','ToastService', function ($scope, USER_ROLES, AuthService, $location, Session, UserService, $rootScope, FacebookAuthService, $window, ToastService) {

	$scope.userRoles = USER_ROLES;
	$scope.isAuthorized = AuthService.isAuthorized;
	$rootScope.screenSize = "";

	$scope.onload = function() {
		if($window.innerWidth < 768) {
			$rootScope.typeDevice = 'mobile';
		} else {
			$rootScope.typeDevice = 'noMobile';
			if($window.innerWidth < 992) {
				$rootScope.sizeDevice = 'tablet';
			} else if($window.innerWidth < 1200) {
				$rootScope.sizeDevice = 'medium';
			} else {
				$rootScope.sizeDevice = 'large';
			}
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

	// Delete account
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

datingController.controller('UpdatePasswordCtrl',['$scope','$rootScope','USER_EVENTS','UserService', function ($scope, $rootScope, USER_EVENTS, UserService) {

	$scope.updatePassword = function (pwd) {
		UserService.update(pwd, $rootScope.currentUser.id).then(function (res) {
			$rootScope.$broadcast(USER_EVENTS.passwordSuccess);
			$scope.changePasswordForm.pwd = "";
			$scope.changePasswordForm.$setPristine();
		}, function () {
			$rootScope.$broadcast(USER_EVENTS.passwordFailed);
		});	
	};

}]);

datingController.controller('MapCtrl',['$scope','$rootScope','ToastService','MAP_EVENTS','USER_EVENTS','ProfilService', 'MapService', function ($scope, $rootScope, ToastService, MAP_EVENTS, USER_EVENTS, ProfilService, MapService) {

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
		$rootScope.locationError = false;
		$rootScope.locationSuccess = false;
		$scope.geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				$scope.map.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: $scope.map,
					position: results[0].geometry.location
				});
				ProfilService.update({location: marker.position}).then(function (res) {
					$rootScope.locationSuccess = false;
				});
			} else {
				$rootScope.locationError = false;
				$rootScope.$broadcast(MAP_EVENTS.mapError, status);
			}
		});
	}; // End codeAddress()

	$scope.geolocate = function () {
		$scope.geolocationFailed = false;
		$scope.geolocationSuccess = false;
		$scope.loading = true;
		// Try HTML5 geolocation
		MapService.geolocate().then(function (res) {
			MapService.geocodeCoordinates({A: res.coords.latitude, F: res.coords.longitude}).then(function (res) {
				console.log(res);
				$scope.user.location = res;
				$scope.geolocationSuccess = true;
				$rootScope.$broadcast(MAP_EVENTS.geolocationSuccess);
			}, function () {
				$rootScope.$broadcast(MAP_EVENTS.geolocationFailed);
				$scope.geolocationFailed = true;
			});
		}, function (error) {
			if(error) {
				$rootScope.$broadcast(MAP_EVENTS.mapError);
			} else {
				$rootScope.$broadcast(MAP_EVENTS.geolocationFailed);
			}
			$scope.geolocationFailed = true;
		}).finally(function () {
			$scope.loading = false;
		});
	};// End geolocate()

}]); // End MapCtrl


datingController.controller('ProfilCtrl',['$scope', '$cookies','$rootScope','RESOURCE','ProfilService','UtilityService','USER_EVENTS','$route', 'MapService', function ($scope, $cookies, $rootScope, RESOURCE, ProfilService, UtilityService, USER_EVENTS, $route, MapService) {

	$scope.activeTab = 'profil';
	
	$scope.profil = {
		username: $rootScope.currentProfil.username,
		whyHere: $rootScope.currentProfil.whyHere,
		aboutMe: $rootScope.currentProfil.aboutMe,
		height: $rootScope.currentProfil.height,
		weight: $rootScope.currentProfil.weight,
		skin: $rootScope.currentProfil.skin,
		eyes: $rootScope.currentProfil.eyes,
		hair: $rootScope.currentProfil.hair
	};
	$scope.photos = {};

	$scope.updateList = {};


	$scope.$on(USER_EVENTS.profilLoadSucces, function (event) {

		MapService.geocodeCoordinates($rootScope.currentProfil.location).then(function (res) {
			$scope.profil.location = res;
		});
	});

	$scope.photosDropzoneConfig = {
		options: {
			url: RESOURCE.photos,
			paramName: 'file',
			headers: {
				'X-XSRF-TOKEN': $cookies['XSRF-TOKEN']
			}
		},
		eventHandlers: {
			addedfile: function(file) {},
			sending: function (file, xhr, formData) {
				xhr.setRequestHeader('name', UtilityService.randomAlphaNumeric(10));
			},
			success: function(file, response){
				$scope.displayPhotos();
			}
		}
	};

	$scope.profilDropzoneConfig = {
		options: {
			url: RESOURCE.userFiles,
			paramName: 'file',
			headers: {
				'X-XSRF-TOKEN': $cookies['XSRF-TOKEN'],
				name: 'user_'+$rootScope.currentUser.id
			}
		},
		eventHandlers: {
			addedfile: function(file) {},
			sending: function (file, xhr, formData) {},
			success: function(file, response){
				$rootScope.currentProfil.profil_path = response + '?decache=' + Math.random();
			}
		}
	};

	$scope.displayPhotos = function () {
		ProfilService.indexPhotos().then(function (res) {
			$scope.photos = res;
		});
	};

	$scope.getClass = function (path) {
		return ($scope.activeTab === path) ? "pinkBtn" : "";
	}; // End getClass()

	$scope.setClass = function (path) {
		$scope.activeTab = path;
	}; // End setClass()

	$scope.getAddress = function (address) {
		return MapService.geocodeAddress(address).then(function (res) {
			return res;
		});
	};

	$scope.update = function () {
		ProfilService.update().then(function (res) {

		}, function () {

		});
	}; // End update()

	$scope.updateProfil = function () {
		if($scope.updateList) {
			ProfilService.update($scope.updateList).then(function () {
				$route.reload();
				$rootScope.$broadcast(USER_EVENTS.updateSuccess);
			}, function () {
				$rootScope.$broadcast(USER_EVENTS.updateFailed);
			});
		}
	}; // End updateProfil

	$scope.addToList = function (input) {
		if($rootScope.currentProfil[Object.keys(input)[0]] !== input[Object.keys(input)[0]]) {
			$scope.updateList[Object.keys(input)[0]] = input[Object.keys(input)[0]];
		} else if($rootScope.currentProfil[Object.keys(input)[0]] === input[Object.keys(input)[0]]) {
			delete $scope.updateList[Object.keys(input)[0]];
		}
		console.log($scope.updateList);
	};

	$scope.freeUpdateList = function () {
		$scope.updateList = {};
		$scope.$emit(USER_EVENTS.profilLoadSucces);
		console.log($scope.updateList);
	};

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
					$rootScope.currentUser = res.user;
					$rootScope.currentProfil = res.profil;
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

datingController.controller('AuthCtrl',['$scope','$rootScope','$route','$location','AUTH_EVENTS','AuthService','FacebookAuthService','AuthInterceptor', function ($scope, $rootScope, $route, $location, AUTH_EVENTS, AuthService, FacebookAuthService, AuthInterceptor) {

	$scope.credentials = {};

	// Authenticate user
	$scope.login = function (credentials) {
		
		AuthService.login(credentials).then(function (res) {
			$rootScope.currentUser = res.user;
			$rootScope.currentProfil = res.profil;
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