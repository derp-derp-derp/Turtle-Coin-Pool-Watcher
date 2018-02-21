'use strict';

angular.module('tc.filters', [])

.filter('timeAgoLastShare', function() {
  return function(date) {
    var d = new Date(parseInt(date) * 1000).toISOString();
    return jQuery.timeago(d);
  }
})

.filter('chartHashFormat', function() {
  return function(hashrate) {
    var i = 0;
    var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH' ];
    while (hashrate > 1000){
        hashrate = hashrate / 1000;
        i++;
    }
    return hashrate.toFixed(2) + byteUnits[i];
  }
});