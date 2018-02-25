'use strict';

angular.module('tc.services', [])

.service('minerService', ['$http', function($http){
   
   return {
      getStats: function( pool_api_url, wallet_address ) {
          return $http.get(atob(pool_api_url) + 'stats_address?address=' + wallet_address + '&longpoll=longpoll', { cache: true }).then(function(result) {
              return result.data;
          });
      }
   }
}])

.service('poolService', ['$http', function($http){
   
   return {
      getStats: function( pool_api_url ) {
          return $http.get(atob(pool_api_url) + 'live_stats', { cache: true }).then(function(result) {
              return result.data;
          });
      }
   }
}]);