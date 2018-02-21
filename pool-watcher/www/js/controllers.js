'use strict';

angular.module('tc.controllers', [])

.controller('HomeCtrl', ['$scope', '$location', function HomeCtrl($scope, $location) {
    var doSubmitPool = function() {
        //var pool = $('#poolApiUrl').val();
        var pool = '1';
        var wallet_address = $('#walletAddress').val();
        
        if(wallet_address.length > 1 && wallet_address !== 'Wallet address') {
            var full_path = '/dashboard/' + pool + '/' + wallet_address;
            $location.path(full_path);
            $location.replace();
            $scope.$apply();
        }
    };
    
    $('#submitPool').on('keydown', function(e) {
        if (e.which == 13) {
            doSubmitPool();
            e.preventDefault();
        }
    });
    
    $('#submitPool').on('click', function(){
        doSubmitPool();
    });
}])

.controller('DashboardCtrl', ['$scope', '$route', '$timeout', 'poolService', function DashboardCtrl($scope, $route, $timeout, poolService) {
    $scope.pool_api_url = $route.current.params.pool;
    $scope.wallet_address = $route.current.params.wallet_address;
    $scope.loading = true;
    
    poolService.getMinerStats( $scope.pool_api_url, $scope.wallet_address ).then(function(stats) {
        $scope.miner_stats = stats;
        $scope.loading = false;
    });
    
    $scope.timer = $timeout(function() {
        // hack for header not being at top after submit
        // home search form without closing keyboard first
        window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
    }, 100);
    
    $scope.$on("$destroy", function(){
        $timeout.cancel($scope.timer);
    });
}]);
