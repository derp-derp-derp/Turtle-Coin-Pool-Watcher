'use strict';

angular.module('tc.services', [])

.service('poolService', ['$http', function($http){
   
   return {
      getMinerStats: function( pool_api_url, wallet_address ) {
          return $http.get('http://us.turtlepool.space/api/stats_address?address=' + wallet_address, { cache: true }).then(function(result) {
              return result.data;
          });
      }
   }
}]);