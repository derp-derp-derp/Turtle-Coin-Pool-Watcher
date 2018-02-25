'use strict';

angular.module('tc.filters', [])

.filter('timeAgo', function() {
  return function(date) {
    var d = new Date(parseInt(date) * 1000).toISOString();
    return jQuery.timeago(d);
  }
})

.filter('hashrateFormat', function() {
  return function(hashrate) {
    var i = 0;
    var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH' ];
    while (hashrate > 1000){
        hashrate = hashrate / 1000;
        i++;
    }
    return hashrate.toFixed(2) + byteUnits[i];
  }
})

.filter('formatTRTL', function() {
  return function(amount) {
    return (Number(amount) / 100).toFixed(2);
  }
});