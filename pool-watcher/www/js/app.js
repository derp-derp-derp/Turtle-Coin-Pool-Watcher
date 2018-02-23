'use strict';

angular.module('tc', [
	'ngRoute',
	'ngTouch',
	'tc.services',
	'tc.directives',
	'tc.filters',
	'tc.controllers'
])

.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
	$routeProvider
	.when('/home', {
		templateUrl: 'views/home.html',
		controller: 'HomeCtrl as home'
	})
	.when('/template', {
		templateUrl: 'views/template.html',
		controller: 'TemplateCtrl as template'
	})
	.when('/dashboard/:pool/:wallet_address', {
		templateUrl: 'views/dashboard.html',
		controller: 'DashboardCtrl as dashboard'
	})
	.otherwise({
		templateUrl: 'views/home.html',
		controller: 'HomeCtrl as home'
	});
}]);

(function($){
    setTimeout(function() {
        navigator.splashscreen.hide();
    }, 1500);
})(jQuery);