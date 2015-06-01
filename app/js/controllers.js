'use strict';

/* Controllers */

var datingController = angular.module('datingControllers', ['angularFileUpload', 'ngToast', 'ngCookies','ngTouch','ngAnimate','angular-loading-bar','bootstrapLightbox','ui.bootstrap','visualCaptcha']);

datingController.controller('SearchUsersCtrl',['$scope','SearchService','PROFIL_EVENTS','$rootScope', function ($scope, SearchService, PROFIL_EVENTS, $rootScope) {

	$scope.updateList = {};
	$scope.encounterError = "";
	$scope.encounters = "";


	$scope.getFilters = function (filter) {
		var now = new Date().getFullYear();
		var ageMin = filter.dob[0];
		var ageMax = filter.dob[1];
		filter.dob[0] = now - ageMax+'-00-00';
		filter.dob[1] = now - ageMin+'-00-00';
		SearchService.usersFiltered(filter).then(function (res) {
			$scope.encounters = res;
			$rootScope.$broadcast(PROFIL_EVENTS.searchSuccess);
			$scope.filter.dob[0] = ageMin;
			$scope.filter.dob[1] = ageMax;
		}, function () {
			$scope.encounterError = "Sorry, no matches !";
			$rootScope.$broadcast(PROFIL_EVENTS.searchFailed);
		});
	};

}]); // End SearchUsersCtrl

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
			$scope.pwd = {};
			$scope.changePasswordForm.$setPristine();
			$rootScope.$broadcast(USER_EVENTS.passwordSuccess);
		}, function () {
			$rootScope.$broadcast(USER_EVENTS.passwordFailed);
		});	
	};

}]); // End UpdatePasswordCtrl

datingController.controller('MapCtrl',['$scope','$rootScope','ToastService','MAP_EVENTS','USER_EVENTS','ProfilService', 'MapService', function ($scope, $rootScope, ToastService, MAP_EVENTS, USER_EVENTS, ProfilService, MapService) {

	$scope.geocoder;
	$scope.map;
	$scope.loading = false;

	$scope.initialize = function (address) {
		console.log("loading map");
		$scope.geocoder = new google.maps.Geocoder();

		MapService.geocodeAddress(address).then(function (results) {

			var latlng = new google.maps.LatLng(results[0].geometry.location.A, results[0].geometry.location.F);

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
		});


	}; // End initialize()

	$scope.$on(USER_EVENTS.profilLoadSucces, function (event) {
		event.currentScope.initialize($rootScope.currentProfil.location);
	});


	$scope.geolocate = function () {
		$scope.loading = true;
		// Try HTML5 geolocation
		MapService.geolocate().then(function (res) {
			MapService.geocodeCoordinates({A: res.coords.latitude, F: res.coords.longitude}).then(function (res) {
				$scope.profil.location = res;
				$scope.addToList({location:$scope.profil.location});
				$rootScope.$broadcast(MAP_EVENTS.geolocationSuccess);
			}, function () {
				$rootScope.$broadcast(MAP_EVENTS.geolocationFailed);
			});
		}, function (error) {
			if(error) {
				$rootScope.$broadcast(MAP_EVENTS.mapError);
			} else {
				$rootScope.$broadcast(MAP_EVENTS.geolocationFailed);
			}
		}).finally(function () {
			$scope.loading = false;
		});
	};// End geolocate()

}]); // End MapCtrl


datingController.controller('ProfilCtrl',['$scope', '$cookies','$rootScope','RESOURCE','ProfilService','UtilityService','USER_EVENTS','$route', 'MapService', 'InvitationService', 'ToastService', 'WingNoteService','$modal','Lightbox','PhotosService', function ($scope, $cookies, $rootScope, RESOURCE, ProfilService, UtilityService, USER_EVENTS, $route, MapService, InvitationService, ToastService, WingNoteService, $modal, Lightbox, PhotosService) {

	$scope.activeTab = 'profile';
	
	$scope.photos = {};

	$scope.updateList = {};

	$scope.selected1 = true;

	$scope.updateDesc = false;

	$scope.$on(USER_EVENTS.profilLoadSucces, function (event) {

		$scope.profil = {
			username: $rootScope.currentProfil.username,
			whyHere: $rootScope.currentProfil.whyHere,
			aboutMe: $rootScope.currentProfil.aboutMe,
			height: $rootScope.currentProfil.height,
			weight: $rootScope.currentProfil.weight,
			skin: $rootScope.currentProfil.skin,
			eyes: $rootScope.currentProfil.eyes,
			hair: $rootScope.currentProfil.hair,
			location: $rootScope.currentProfil.location
		};
	});

	$scope.photosDropzoneConfig = {
		options: {
			url: RESOURCE.user+'/'+$rootScope.currentUser.id+'/photos',
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
		PhotosService.index($rootScope.currentUser.id).then(function (photos) {
			$scope.photos = photos;
		});
	};

	$scope.openLightboxModal = function (index) {
		Lightbox.openModal($scope.photos, index, $scope);
	};

	$scope.newDesc = function (image) {
		PhotosService.update($rootScope.currentUser.id, image).then(function (res) {
			if(res) {
				ToastService.show('Description updated', 'success');
			} else {
				ToastService.show('Description update failed', 'warning');
			}
		}, function () {
			ToastService.show('Description update failed', 'warning');
		});
	};

	$scope.deleteImage = function (image) {
		PhotosService.delete($rootScope.currentUser.id, image.id).then(function (res) {
			if(res) {
				ToastService.show('Photo deleted', 'success');
			} else {
				ToastService.show('Photo delete failed', 'warning');
			}
		}, function () {
			ToastService.show('Photo delete failed', 'warning');
		});
	};

	$scope.displayWingNotes = function () {
		WingNoteService.index($rootScope.currentUser.id).then(function (wingNotes) {
			$scope.wingNotes = wingNotes;
			for(var i = 0; i < wingNotes.length; i++) {
				ProfilService.show(wingNotes.emitter_id).then(function (profil) {
					$scope.wingNotes[i].profil = profil;
				});
			}
		});
	};

	$scope.getClass = function (path) {
		return ($scope.activeTab === path) ? "pinkBtn" : "greyBtn";
	}; // End getClass()

	$scope.setClass = function (path) {
		$scope.activeTab = path;
	}; // End setClass()

	$scope.getAddress = function (address) {
		return MapService.geocodeAddress(address).then(function (res) {
			return res;
		});
	};

	$scope.updateProfil = function () {
		if($scope.updateList) {
			ProfilService.update($scope.updateList).then(function () {
				$rootScope.$broadcast(USER_EVENTS.updateSuccess);
				$route.reload();
			}, function () {
				$rootScope.$broadcast(USER_EVENTS.updateFailed);
			});
		}
	}; // End updateProfil

	$scope.addToList = function (input) {
		var value = input[Object.keys(input)[0]]
		if($rootScope.currentProfil[Object.keys(input)[0]] !== value) {
			$scope.updateList[Object.keys(input)[0]] = input[Object.keys(input)[0]];
		} else if($rootScope.currentProfil[Object.keys(input)[0]] === input[Object.keys(input)[0]]) {
			delete $scope.updateList[Object.keys(input)[0]];
		}
	};

	$scope.asyncAddToList = function (input) {
		if(Object.keys(input)[0] === "location") {
			MapService.geocodeAddress(input[Object.keys(input)[0]]).then(function (res) {
				if(JSON.stringify(res[0].geometry.location) !== JSON.stringify($rootScope.currentProfil.location) ) {
					$scope.updateList[Object.keys(input)[0]] = res[0].geometry.location;
				} else {
					delete $scope.updateList[Object.keys(input)[0]];
				}
			});
		}
	};

	$scope.freeUpdateList = function () {
		$scope.updateList = {};
		$scope.$emit(USER_EVENTS.profilLoadSucces);
	};


	$scope.sendInvitation = function (email) {
		$scope.loading = true;
		InvitationService.send(email).then(function (res) {
			ToastService.show('The invitation was sent', 'success');
		}, function () {
			ToastService.show('The invitation was not sent', 'danger');
		})
		.finally(function () {
			$scope.loading = false;
		});
	};

	$scope.displayWingNotes = function () {
		WingNoteService.index($rootScope.currentUser.id).then(function (wingNotes) {
			$scope.wingNotes = wingNotes;
			angular.forEach($scope.wingNotes, function (wingNote) {
				ProfilService.show(wingNote.emitter_id).then(function (profil) {
					wingNote.profil = profil;
				});
			});
		});
	};

	$scope.open = function (size) {

		var addWingNoteModal = $modal.open({
			animation: true,
			templateUrl: 'partials/wingnote.html',
			controller: 'ProfilCtrl',
		});
	};

	$scope.addWingNote = function (wingNote) {
		wingNote.receiver_id = $rootScope.visitedProfil.user_id;
		wingNote.user_id = $rootScope.currentUser.id;
		WingNoteService.add(wingNote).then(function (res) {
			if(res) {
				ToastService.show('The WingNote was posted succesfuly', 'success');
			} else {
				ToastService.show('You already posted a WingNote for '+$rootScope.visitedProfil.username, 'warning');
			}
		}, function () {
			ToastService.show('An error occured while sending your WingNote', 'danger');
		});
	};

	$scope.openDeleteWingNote = function (wingNote) {
		$scope.currentWingNote = wingNote;
	};

	$scope.deleteWingNote = function (wingNote) {
		WingNoteService.delete(wingNote).then(function () {
			$scope.displayWingNotes();
			ToastService.show('The WingNote has been well deleted', 'success');
		}, function () {
			ToastService.show('An error occured while deleting the WingNote', 'danger');
		});
	};

	
}]); // ./End ProfilCtrl


datingController.controller('RegistrarCtrl',['UserService','$rootScope','$scope','$route','$location','USER_EVENTS','$routeParams', 'ValidationService', '$q', function (UserService, $rootScope, $scope, $route, $location, USER_EVENTS, $routeParams, ValidationService, $q) {

	$scope.submitted = false;
	$scope.loading = false;
	$scope.activated = false;
	$scope.selected = 0;


	$scope.captchaOptions = {
		imgPath: 'components/visual-captcha-angular/img/',
		captcha: { 
			numberOfImages: 5 ,
			url: '/api/public'
		},
        // use init callback to get captcha object
        init: function (captcha) {
        	$scope.captcha = captcha;
        }
    };

    $scope.isCaptchaValid = function () {

    	var deferred = $q.defer();

    	if($scope.captcha.getCaptchaData().valid) {
    		var captchaValues = {
    			name: $scope.captcha.getCaptchaData().name,
    			value: $scope.captcha.getCaptchaData().value
    		};
    		ValidationService.isCaptchaValid(captchaValues).then(function (valid) {
    			console.log(valid);
    			if(valid) {
    				deferred.resolve();
    			} else {
    				deferred.reject();
    			}
    		}, function (error) {
    			deferred.reject();
    		});
    	} else {
    		deferred.reject();
    	}

    	return deferred.promise;
    };

    $scope.register = function (user) {
    	$scope.loading = true;
    	$scope.isCaptchaValid().then(function (success) {
    		user.invitation = ($routeParams.token) ? $routeParams.token : null;
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
    	}, function (error) {
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

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		console.log('click');
		$scope.opened = true;
	};

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
	$scope.selected = 0;

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