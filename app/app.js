angular.module('MyApp', ['ngRoute', 'satellizer', 'naif.base64', 'checklist-model'])
  .config(function($routeProvider, $locationProvider, $authProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'partials/home.html'
      })
      .when('/contact', {
        templateUrl: 'partials/contact.html',
        controller: 'ContactCtrl'
      })
      .when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'SignupCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/account', {
        templateUrl: 'partials/profile.html',
        controller: 'ProfileCtrl',
        resolve: { loginRequired: loginRequired }
      })
      .when('/websites', {
        templateUrl: 'partials/websites.html',
        controller: 'WebsitesCtrl',
        resolve: { loginRequired: loginRequired }
      })
      .when('/websites/:id', {
        templateUrl: 'partials/website.html',
        controller: 'WebsiteCtrl',
        resolve: { loginRequired: loginRequired }
      })
      .when('/websites/:websiteId/section/:id', {
        templateUrl: 'partials/page.html',
        controller: 'PageCtrl',
        resolve: { loginRequired: loginRequired }
      })
      .when('/templates', {
        templateUrl: 'partials/templates.html',
        controller: 'TemplatesCtrl',
        resolve: { loginRequired: loginRequired, isAdmin: isAdmin }
      })
      .when('/editors', {
        templateUrl: 'partials/editors.html',
        controller: 'EditorsCtrl',
        resolve: { loginRequired: loginRequired, isAdmin: isAdmin }
      })
      .when('/forgot', {
        templateUrl: 'partials/forgot.html',
        controller: 'ForgotCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/reset/:token', {
        templateUrl: 'partials/reset.html',
        controller: 'ResetCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .otherwise({
        templateUrl: 'partials/404.html'
      });

    $authProvider.loginUrl = '/login';
    $authProvider.signupUrl = '/signup';
    $authProvider.google({
      url: '/auth/google',
      clientId: '631036554609-v5hm2amv4pvico3asfi97f54sc51ji4o.apps.googleusercontent.com'
    });

    function isAdmin($rootScope){
      return $rootScope.isAdmin();
    }

    function skipIfAuthenticated($location, $auth) {
      if ($auth.isAuthenticated()) {
        $location.path('/');
      }
    }

    function loginRequired($location, $auth) {
      if (!$auth.isAuthenticated()) {
        $location.path('/login');
      }
    }
  })
  .run(function($rootScope, $window) {
    if ($window.localStorage.user) {
      $rootScope.currentUser = JSON.parse($window.localStorage.user);
    }

    $rootScope.isAdmin = function(){
      return !$rootScope.currentUser.editor;
    };

    $rootScope.libs = {};
    $rootScope.libs.utils = $window.libs.utils;
  }).filter('json', function() {
    return function(input) {
        return JSON.stringify(input)
    };
  }).filter('title', function () {
    return function (input) {
      if(input != undefined && input != null && input != '')
        return input;
      return 'Title';
  };
});;
