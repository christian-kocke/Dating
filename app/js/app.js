'use strict';

/* App Module */

var datingApp = angular.module('datingApp',['ngRoute','datingControllers','datingServices','ngToast', 'ngAnimate','datingFilters','datingDirectives','datingAnimations', 'mgcrea.ngStrap', 'ui.bootstrap-slider', 'bootstrapLightbox', 'ngTouch']);

datingApp.config(['$routeProvider','$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider.
    when('/', {
        templateUrl: 'partials/login.html',
        url: '/protected',
        controller: 'AuthCtrl',
        redirection: ['AuthService', function (AuthService) {
            if(AuthService.isAuthenticated()) {
                return '/profil';
            }
        }],
    }).
    when('/encounters', {
        templateUrl: 'partials/encounters.html',
        resolve: {
            auth: ['AuthResolver', function resolveAuthentication (AuthResolver) { 
                return AuthResolver.resolve(false, '/');
            }]
        }
    }).
    when('/signup', {
        templateUrl: 'partials/registration.html',
        controller: 'RegistrarCtrl',
        resolve: {
            auth: ['AuthResolver', function resolveAuthentication (AuthResolver) { 
                return AuthResolver.resolve('/profil', false);
            }]
        }
    }).
    when('/profil', {
        templateUrl: 'partials/userProfil.html',
        controller: 'ProfilCtrl',
        resolve: {
            auth: ['AuthResolver', function resolveAuthentication (AuthResolver) { 
                return AuthResolver.resolve(false, '/');
            }],
            profil: ['ProfilResolver', function resolveProfil (ProfilResolver) {
                return ProfilResolver.resolve();
            }]
        }
    }).
    when('/user/:id', {
        templateUrl: 'partials/encounterProfil.html',
        controller: 'ProfilCtrl',
        resolve: {
            auth: ['AuthResolver', function resolveAuthentication (AuthResolver) { 
                return AuthResolver.resolve(false, '/');
            }],
            profil: ['ProfilResolver', '$route', function resolveProfil (ProfilResolver, $route) {
                return ProfilResolver.resolve(parseInt($route.current.params.id));
            }]
        }
    }).
    when('/activation/:token', {
        templateUrl: 'partials/client-activation.html',
        controller: 'RegistrarCtrl',
        resolve: {
            auth: ['AuthResolver', function resolveAuthentication (AuthResolver) { 
                return AuthResolver.resolve('/profil', false);
            }]
        }
    }).
    when('/reset/password', {
        templateUrl: 'partials/send-link.html',
        controller: 'ResetPasswordCtrl',
        resolve: {
            auth: ['AuthResolver', function resolveAuthentication (AuthResolver) { 
                return AuthResolver.resolve('/profil', false);
            }]
        }
    }).
    when('/reset/password/:token', {
        templateUrl: 'partials/change-password.html',
        controller: 'ResetPasswordCtrl',
        resolve: {
            auth: ['AuthResolver', function resolveAuthentication (AuthResolver) { 
                return AuthResolver.resolve('/profil', false);
            }],
        }
    }).
    when('/invitation/:token', {
        templateUrl: 'partials/registration.html',
        controller: 'RegistrarCtrl'
    }).
    otherwise({
        redirectTo: '/',
    });
    $locationProvider.html5Mode(false);

}]).run(['$rootScope','AUTH_EVENTS','FILE_EVENTS','USER_EVENTS','MAP_EVENTS','PROFIL_EVENTS','ngToast','AuthService','$log','Session','$q','$location','$injector','$window','FacebookAuthService','ToastService', function ($rootScope, AUTH_EVENTS, FILE_EVENTS, USER_EVENTS, MAP_EVENTS, PROFIL_EVENTS, ngToast, AuthService, $log, Session, $q, $location, $injector, $window, FacebookAuthService, ToastService) {

    window.addEventListener('resize', function () {
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
        $rootScope.$apply();
    });

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Facebook sdk initialisation
    $window.fbAsyncInit = function() {
        FB.init({ 
            appId: '460763907420583',
            channelUrl: '../channel.html',
            status: true, 
            cookie: true, 
            xfbml: true,
            version: 'v2.3'
        });
        FacebookAuthService.WatchAuthStatusChange();
    };
    $rootScope.deferredFB = $q.defer();
    $rootScope.deferred = $q.defer();

    AuthService.retrieveUser().then(function (res) {
        if(res) {
            $rootScope.currentUser = res.user;
            $rootScope.currentProfil = res.profil;
            $rootScope.deferred.resolve("normal success");
        } else {
            $rootScope.currentUser = null;
            $rootScope.deferred.reject("normal echec");
        }

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if(next && next.data){
                var authorizedRoles = next.data.authorizedRoles;
                if (!AuthService.isAuthorized(authorizedRoles)) {
                    event.preventDefault();
                    if (AuthService.isAuthenticated()) {
                        // user is not allowed
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                    } else {
                        // user is not logged in
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    }
                }
            }
        });
    });

    $rootScope.$on('$routeChangeSuccess', function (event, next, current) {
        if(next && next.$$route){
            var redirectionFunction = next.$$route.redirection;
            if(redirectionFunction){
                var route = $injector.invoke(redirectionFunction);
                if(route){
                    $location.path(route);
                }
            }
        }
    });


    // Session
    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
        var aToast = ngToast.create({
            className: 'danger',
            content: 'Your session timed out, please reconnect !'
        });
    });

    $rootScope.$on(AUTH_EVENTS.loginFailed, function () {
        var aToast = ngToast.create({
            className: 'danger',
            content: 'Login failed, please verify your informations !'
        });
    });
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
        var aToast = ngToast.create({
            className: 'success',
            content: 'Hello , <strong>'+ $rootScope.currentProfil.username+'</strong> nice to see you again !'
        });
    });
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
        if($location.path() !== '/') {
            var aToast = ngToast.create({
                className: 'danger',
                content: 'You\'re not authenticated !'
            });
        }
    });
    $rootScope.$on(AUTH_EVENTS.notAuthorized, function () {
        var aToast = ngToast.create({
            className: 'danger',
            content: 'You are not authorized !'
        });
    });

    // Image Upload 
    $rootScope.$on(FILE_EVENTS.uploadSuccess, function () {
        var aToast = ngToast.create({
            className: 'success',
            content: 'Your picture has been uploaded !'
        });
    });
    $rootScope.$on(FILE_EVENTS.uploadFailed, function () {
        var aToast = ngToast.create({
            className: 'warning',
            content: 'Sorry, we can\'t upload your picture, maybe try another format !'
        });
    });

    // Update Profil Username
    $rootScope.$on(USER_EVENTS.updateSuccess, function () {
        /*AuthService.retrieveUser().then(function (user) {
            $rootScope.currentUser = user;
        });*/
        ToastService.show('Your profil has been well updated !', 'success');
    });

    $rootScope.$on(USER_EVENTS.updateFailed, function () {
        var aToast = ngToast.create({
            className: 'warning',
            content: 'Your profil can\'t be updated, please try again !'
        });
    });


    // Update Password
    $rootScope.$on(USER_EVENTS.passwordSuccess, function () {
        var aToast = ngToast.create({
            className: 'success',
            content: 'Your password has been changed !'
        });
    });
    $rootScope.$on(USER_EVENTS.passwordFailed, function () {
        AuthService.retrieveUser().then(function (user) {
            $rootScope.currentUser = user;
        });
        var aToast = ngToast.create({
            className: 'warning',
            content: 'Your password can\'t be changed, please try again !'
        });
    });

    // Registration
    $rootScope.$on(USER_EVENTS.registrationSuccess, function () {
        var aToast = ngToast.create({
            className: 'success',
            content: 'You are well registred, thank you ! <br> Please log in'
        });
    });
    $rootScope.$on(USER_EVENTS.registrationFailed, function () {
        var aToast = ngToast.create({
            className: 'warning',
            content: 'Sorry, the registration failed, please try again !'
        });
    });

    //Reset password
    $rootScope.$on(USER_EVENTS.resetSuccess, function () {
        var aToast = ngToast.create({
            className: 'success',
            content: 'You\'re password has been reset'
        });
    });

    $rootScope.$on(USER_EVENTS.resetFailed, function () {
        var aToast = ngToast.create({
            className: 'danger',
            content: 'An error occured while reseting you\'re password'
        });
    });

    $rootScope.$on(USER_EVENTS.resetExpired, function () {
        var aToast = ngToast.create({
            className: 'danger',
            content: 'This link has expired !'
        });
    });

    //account activation
    $rootScope.$on(USER_EVENTS.accountNotActivated, function () {
        var aToast = ngToast.create({
            className: 'danger',
            content: 'Your account is not activated, check your mailbox !'
        });
    });

    //map events
    $rootScope.$on(MAP_EVENTS.mapError, function (event, status) {
        ToastService.show('Map error', 'danger');
    });
    $rootScope.$on(MAP_EVENTS.geolocationFailed, function (event) {
        ToastService.show('You have disabled geolocation, please re-activate it', 'warning');
    });
    $rootScope.$on(MAP_EVENTS.geolocationSuccess, function (event) {
        ToastService.show('Geolocation success', 'success');
    });

    // Encounter Events
    $rootScope.$on(PROFIL_EVENTS.searchSuccess, function (event) {
        ToastService.show('We found many people you might like !', 'success');
    });
    $rootScope.$on(PROFIL_EVENTS.searchFailed, function (event) {
        ToastService.show('Nobody was founded try to be less exigent !', 'warning');
    });
}]);

datingApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(['$injector', function ($injector) {
        return $injector.get('AuthInterceptor');
    }]);
}]);

datingApp.config(['ngToastProvider', function(ngToast) {

    ngToast.configure({
        verticalPosition: 'top',
        horizontalPosition: 'center',
        maxNumber: 2,
        animation: 'slide',
        dismissOnClick: true,
        dismissOnTimeout: true,
        timeout: 3000,
    });
}]);

datingApp.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
}).constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    client: 'client',
}).constant('FILE_EVENTS', {
    uploadSuccess: 'upload-file-success',
    uploadFailed: 'upload-file-failed',
    deleteSuccess: 'delete-file-success',
    deleteFailed: 'delete-file-failed'
}).constant('USER_EVENTS', {
    registrationSuccess: 'registration-user-success',
    registrationFailed: 'registration-user-failed',
    updateSuccess: 'update-user-success',
    updateFailed: 'update-user-failed',
    passwordSuccess: "password-user-success",
    passwordFailed: "password-user-failed",
    deleteSuccess: "delete-user-success",
    deleteFailed: "delete-user-failed",
    emailSucces: "send-email-success",
    emailFailed: "send-email-failed",
    resetSuccess: "password-reset-success",
    resetFailed: "password-reset-failed",
    resetExpired: "password-reset-expired",
    accountNotActivated: "account-not-activated",
    activationFailed: "account-activation-failed",
    profilLoadSuccess: "user-profil-load-success",
    profilLoadFailed: "user-profil-load-failed"
}).constant('PROFIL_EVENTS', {
    searchSuccess: 'search-encounters-success',
    searchFailed: 'search-encounters-failed'
}).constant('MAP_EVENTS', {
    mapError: 'map-error',
    geolocationFailed: 'map-geolocation-failed',
    geolocationNotSupported: 'map-geolocation-not-supported',
    geolocationSuccess: 'map-geolocation-success'
}).constant('RESOURCE', {
    user: '/api/public/user',
    userFiles: '/api/public/user/file',
    profil: '/api/public/user/profil',
    photos: '/api/public/user/photos',
    resetPassword: '/api/public/password',
    invitation: '/api/public/user/invitation',
    templates: '/dating/app/partials'
});

