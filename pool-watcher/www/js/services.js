'use strict';

angular.module('tc.services', [])

.service('poolService', ['$http', function($http){
   
   return {
      getMinerStats: function( pool_api_url, wallet_address ) {
          return $http.get(atob(pool_api_url) + 'stats_address?address=' + wallet_address + '&longpoll=longpoll', { cache: true }).then(function(result) {
              return result.data;
          });
      }
   }
}]);