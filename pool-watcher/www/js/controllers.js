'use strict';

angular.module('tc.controllers', [])

.controller('HomeCtrl', ['$scope', '$location', function HomeCtrl($scope, $location) {
    
    var storage = window.localStorage;
    var storage_wallet_address = storage.getItem('wallet_address');
    var storage_selected_pool = storage.getItem('selected_pool');
    var storage_selected_pool_index = storage.getItem('selected_pool_index');
    var wallet_input = $('#walletAddress');
    var pool_input = $('#poolApiUrl');
    var sendToDashboard = function(wallet, pool, apply=null)
    {
        var full_path = '/dashboard/' + pool + '/' + wallet;
        $location.path(full_path);
        $location.replace();
        if(apply)
        {
            $scope.$apply();
        }
    };
    var getParameterByName = function (name, url)
    {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };
    
    // auto-forward to dashboard per previous selections
    if(storage_wallet_address &&  storage_selected_pool && (getParameterByName('reset') !== 'address'))
    {
        sendToDashboard(
            storage_wallet_address,
            btoa(storage_selected_pool)
        );
    }
    
    // check for previously stored
    if(!storage_wallet_address)
    {
        wallet_input.val('Wallet address');
    }
    else
    {
        wallet_input.val(storage_wallet_address);
    }
    
    if(!storage_selected_pool_index)
    {
        // select first entry in the list of pools by default
        pool_input.children().eq(0).prop('selected', true);
    }
    else
    {
        // select previously selected pool
        pool_input.children().eq(storage_selected_pool_index).prop('selected', true);
    }
    
    var doSubmitPool = function() {
        var pool = btoa(pool_input.val());
        var wallet_address = wallet_input.val();
        
        if(wallet_address.length > 1 && wallet_address !== 'Wallet address') {
            
            storage.setItem('wallet_address', wallet_address);
            storage.setItem('selected_pool', pool_input.val());
            storage.setItem('selected_pool_index', pool_input[0].selectedIndex);
            
            sendToDashboard(wallet_address, pool, true);
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
        if(stats.error == "not found")
        {
            $scope.has_results = false;
        }
        else
        {
            $scope.has_results = true;
        
            $scope.miner_stats = stats.stats;
            $scope.paid_formatted = (Number(stats.stats.paid) / 100).toFixed(2);
            $scope.balance_formatted = (Number(stats.stats.balance) / 100).toFixed(2);
            $scope.last_share = $filter('timeAgo')(stats.stats.lastShare);
            $scope.hashrate_chart = stats.charts.hashrate;
            
            var hashes = [];
            
            angular.forEach(stats.charts.hashrate, function(value, key) {
                
                if(stats.charts.hashrate.length > 30)
                {
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
                }
                else
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
        }
        
        $scope.loading = false;
        
        var $context_menu = $('#context_menu');
        $context_menu.hide();
        
        $('#context_menu_toggle').on('click', function(){
            $context_menu.show();
            setTimeout(function() {
                $context_menu.hide();
            }, 3000);
        });
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
        $scope.network_last_updated = $filter('timeAgo')(stats.network.timestamp);
        $scope.min_payment = $filter('formatTRTL')(stats.config.minPaymentThreshold);
        $scope.block_reward = $filter('formatTRTL')(stats.network.reward);
        $scope.pool_hashrate = $filter('hashrateFormat')(stats.pool.hashrate);
        
        var hashes = [];
        
        angular.forEach(stats.charts.hashrate, function(value, key) {
            
            if(stats.charts.hashrate.length > 30)
            {
                // API gives us the last 48 data points by default
                // only show the most recent 15
                if(key >= 33)
                {
                    var data_point = {
                        name: stats.charts.hashrate[key][0],
                        y: Number(stats.charts.hashrate[key][1])
                    }
                    hashes.push(data_point);
                }
            }
            else
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
        
        if(stats.payments)
        {
            for (var i = 0; i < stats.payments.length; i += 2){
                var payment = parsePayment(stats.payments[i + 1], stats.payments[i]);
                minerPayments.push(payment);
            }
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
