'use strict';

angular.module('tc.controllers', [])

.controller('HomeCtrl', ['$scope', '$location', function HomeCtrl($scope, $location) {
    
    var storage = window.localStorage;
    var storage_wallet_address = storage.getItem('wallet_address');
    var wallet_input = $('#walletAddress');
    
    if(!storage_wallet_address)
    {
        wallet_input.val('Wallet address');
    }
    else
    {
        wallet_input.val(storage_wallet_address);
    }
    
    var doSubmitPool = function() {
        var pool = btoa($('#poolApiUrl').val());
        var wallet_address = wallet_input.val();
        
        if(wallet_address.length > 1 && wallet_address !== 'Wallet address') {
            
            storage.setItem('wallet_address', wallet_address);
            
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

.controller('DashboardCtrl', ['$scope', '$location', '$route', '$timeout', '$filter', 'minerService', function DashboardCtrl($scope, $location, $route, $timeout, $filter,  minerService) {
    
    $scope.getClass = function (path) {
        return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    }
    
    var poolInfo = atob($route.current.params.pool)
    poolInfo = poolInfo.split("|");
    
    $scope.pool_encoded = $route.current.params.pool;
    $scope.pool_name = poolInfo[0];
    $scope.pool_api_url = btoa(poolInfo[1]);
    $scope.wallet_address = $route.current.params.wallet_address;
    $scope.loading = true;
    
    minerService.getStats( $scope.pool_api_url, $scope.wallet_address ).then(function(stats) {
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
        
        setTimeout(function() {
            $('#chart').highcharts({
                chart: {
                    type: "areaspline",
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
                        return $filter('timeAgo')(this.point.name) + '<br>' + $filter('hashrateFormat')(this.point.y) + '/sec';
                    },
                    shadow: false
                },
                series: [{
                    color: '#5d5d5d',
                    data: hashes
                }]
            });
        }, 500);
        
        var $context_menu = $('#context_menu');
        $context_menu.hide();
        
        $('#context_menu_toggle').on('click', function(){
            $context_menu.show();
            setTimeout(function() {
                $context_menu.hide();
            }, 3000);
        });
            
        $scope.loading = false;
    });
    
    $scope.timer = $timeout(function() {
        // fix for header not being at top after submit
        // home search form without closing keyboard first
        window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
    }, 100);
    
    $scope.$on("$destroy", function(){
        $timeout.cancel($scope.timer);
    });
}])

.controller('PoolCtrl', ['$scope', '$location', '$route', '$timeout', '$filter', 'poolService', function PoolCtrl($scope, $location, $route, $timeout, $filter,  poolService) {
    
    $scope.getClass = function (path) {
        return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    }
    
    var poolInfo = atob($route.current.params.pool)
    poolInfo = poolInfo.split("|");
    
    $scope.pool_encoded = $route.current.params.pool;
    $scope.pool_name = poolInfo[0];
    $scope.pool_api_url = btoa(poolInfo[1]);
    $scope.wallet_address = $route.current.params.wallet_address;
    $scope.loading = true;
    
    poolService.getStats( $scope.pool_api_url ).then(function(stats) {

        $scope.pool_stats = stats.pool;
        $scope.pool_config = stats.config;
        $scope.network_stats = stats.network;
        $scope.network_last_updated = $filter('timeAgo')(parseInt(stats.network.timestamp));
        $scope.min_payment = $filter('formatTRTL')(stats.config.minPaymentThreshold);
        $scope.block_reward = $filter('formatTRTL')(stats.network.reward);
        $scope.pool_hashrate = $filter('hashrateFormat')(stats.pool.hashrate);
        
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
        
        setTimeout(function() {
            $('#chart').highcharts({
                chart: {
                    type: "areaspline",
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
                        return $filter('timeAgo')(this.point.name) + '<br>' + $filter('hashrateFormat')(this.point.y) + '/sec';
                    },
                    shadow: false
                },
                series: [{
                    color: '#5d5d5d',
                    data: hashes
                }]
            });
        }, 500);
        
        var $context_menu = $('#context_menu');
        $context_menu.hide();
        
        $('#context_menu_toggle').on('click', function(){
            $context_menu.show();
            setTimeout(function() {
                $context_menu.hide();
            }, 3000);
        });
    
        $scope.loading = false;
    });
    
}])

.controller('PayoutsCtrl', ['$scope', '$location', '$route', '$timeout', '$filter', 'minerService', function PayoutsCtrl($scope, $location, $route, $timeout, $filter,  minerService) {
    
    $scope.getClass = function (path) {
        return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    }

    var poolInfo = atob($route.current.params.pool)
    poolInfo = poolInfo.split("|");
    
    $scope.pool_encoded = $route.current.params.pool;
    $scope.pool_name = poolInfo[0];
    $scope.pool_api_url = btoa(poolInfo[1]);
    $scope.wallet_address = $route.current.params.wallet_address;
    $scope.loading = true;
    
    minerService.getStats( $scope.pool_api_url, $scope.wallet_address ).then(function(stats) {
        
        var parsePayment = function (time, serializedPayment){
            var parts = serializedPayment.split(':');
            return {
                time: $filter('timeAgo')(parseInt(time)),
                hash: parts[0],
                amount: (Number(parts[1]) / 100).toFixed(2)
            };
        };
        
        var minerPayments = [];
        
        for (var i = 0; i < stats.payments.length; i += 2){
            var payment = parsePayment(stats.payments[i + 1], stats.payments[i]);
            minerPayments.push(payment);
        }
        
        $scope.miner_payments = minerPayments;
        
        var $context_menu = $('#context_menu');
        $context_menu.hide();
        
        $('#context_menu_toggle').on('click', function(){
            $context_menu.show();
            setTimeout(function() {
                $context_menu.hide();
            }, 3000);
        });
    
        $scope.loading = false;
    });
    
}]);
