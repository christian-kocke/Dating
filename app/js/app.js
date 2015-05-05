'use strict';

/* App Module */

var datingApp = angular.module('datingApp', [
    'ngRoute',
    'datingControllers',
    'datingServices',
    'ngToast',
    'datingFilters',
    'datingDirectives',
    'datingAnimations'
    ]);

datingApp.config(['$routeProvider', /*'USER_ROLES'*/ '$locationProvider',
    function($routeProvider, $locationProvider, $rootScope) {

        $routeProvider.
        when('/', {
            templateUrl: 'partials/login.html',
            url: '/protected',
            controller: 'AuthCtrl',
            redirection: ['AuthService', '$log', function (AuthService) {
                if(AuthService.isAuthenticated()){
                     return '/profil';
                }
            }],
        }).
        when('/signup', {
            templateUrl: 'partials/registration.html',
            controller: 'RegistrarCtrl',
            resolve: {
                auth: function resolveAuthentication(AuthResolver) { 
                    return AuthResolver.resolve('/profil', false);
                }
            }
        }).
        when('/profil', {
            templateUrl: 'partials/userProfil.html',
            controller: 'ProfilCtrl',
            resolve: {
                auth: function resolveAuthentication(AuthResolver) { 
                    return AuthResolver.resolve(false, '/');
                }
            }
        }).
        when('/activation/:token', {
            templateUrl: 'partials/client-activation.html',
            controller: 'RegistrarCtrl',
            resolve: {
                auth: function resolveAuthentication(AuthResolver) { 
                    return AuthResolver.resolve('/profil', false);
                }
            }
        }).
        when('/reset/password', {
            templateUrl: 'partials/send-link.html',
            controller: 'ResetPasswordCtrl',
            resolve: {
                auth: function resolveAuthentication(AuthResolver) { 
                    return AuthResolver.resolve('/profil', false);
                }
            }
        }).
        when('/reset/password/:token', {
            templateUrl: 'partials/change-password.html',
            controller: 'ResetPasswordCtrl',
            resolve: {
                auth: function resolveAuthentication(AuthResolver) { 
                    return AuthResolver.resolve('/profil', false);
                },
            }
        }).
        otherwise({
            redirectTo: '/',
        });

        $locationProvider.html5Mode(false);
    }

    ]).run(function ($rootScope, AUTH_EVENTS, FILE_EVENTS, USER_EVENTS, ngToast, AuthService, $log, Session, $q, $location, $injector, $window, FacebookAuthService) {
         
        (function(d, s, id){
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

        AuthService.retrieveUser().then(function (user) {
            if(user) {
                $rootScope.currentUser = user;
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
        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function () {
            var aToast = ngToast.create({
                className: 'danger',
                content: 'You are logged out !'
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
                content: 'Hello , <strong>'+ $rootScope.currentUser.firstname+'</strong> nice to see you again !'
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
            AuthService.retrieveUser().then(function (user) {
                $rootScope.currentUser = user;
            });
            var aToast = ngToast.create({
                className: 'success',
                content: 'Your profil has been well updated !'
            });
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

        // Delete account
        $rootScope.$on(USER_EVENTS.deleteSuccess, function () {
            var aToast = ngToast.create({
                className: 'danger',
                content: 'Your account has been remove !'
            });
        });
        $rootScope.$on(USER_EVENTS.deleteFailed, function () {
            var aToast = ngToast.create({
                className: 'success',
                content: 'Sorry, we can\'t remove your account, please try again !'
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
    });

datingApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push(['$injector', function ($injector) {
        return $injector.get('AuthInterceptor');
    }]);
});

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
}).constant('RESOURCE', {
   user: '/api/public/user',
   resetPassword: '/api/public/password',
   templates: '/dating/app/partials'
});

