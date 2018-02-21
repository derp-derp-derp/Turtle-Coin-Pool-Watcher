'use strict';

angular.module('tc.controllers', [])

.controller('HomeCtrl', ['$scope', '$location', function HomeCtrl($scope, $location) {
    var doSubmitPool = function() {
        var pool = btoa($('#poolApiUrl').val());
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

.controller('DashboardCtrl', ['$scope', '$route', '$timeout', '$filter', 'poolService', function DashboardCtrl($scope, $route, $timeout, $filter,  poolService) {
    
    $scope.pool_api_url = $route.current.params.pool;
    $scope.wallet_address = $route.current.params.wallet_address;
    $scope.loading = true;
    
    poolService.getMinerStats( $scope.pool_api_url, $scope.wallet_address ).then(function(stats) {
        $scope.miner_stats = stats.stats;
        $scope.paid_formatted = (Number(stats.stats.paid) / 100).toFixed(2);
        $scope.balance_formatted = (Number(stats.stats.balance) / 100).toFixed(2);
        
        var hashes = [];
        
        angular.forEach(stats.charts.hashrate, function(value, key) {
            // API gives us the last 45 data points by default
            // only show the most recent 15
            if(key >= 30)
            {
                var data_point = {
                    name: stats.charts.hashrate[key][0],
                    y: Number(stats.charts.hashrate[key][1])
                }
                hashes.push(data_point);
            }
        });
        
        $('#chart').highcharts({
            chart: {
                height: 200,
                backgroundColor: '#F9F9F9'
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: '',
                style: {
                    'display':'none'
                }
            },
            yAxis: {
                labels: {
                  style: {
                      fontFamily: '"Roboto", Helvetica, Arial',
                      color: '#5d5d5d'
                  }
                },
                title: {
                    text: ''
                },
                gridLineColor: '#5d5d5d'
            },
            xAxis: {
                labels: {
                  enabled: false  
                },
                lineWidth: 0,
                minorGridLineWidth: 0,
                lineColor: 'transparent',
                minorTickLength: 0,
                tickLength: 0
            },
            tooltip: {
                formatter: function(){
                    return $filter('timeAgoLastShare')(this.point.name) + '<br>' + $filter('chartHashFormat')(this.point.y) + '/sec';
                },
                shadow: false
            },
            series: [{
                color: '#00843d',
                data: hashes
            }]
        });
        
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
