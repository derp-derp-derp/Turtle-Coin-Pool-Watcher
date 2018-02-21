'use strict';

angular.module('tc.filters', [])

.filter('timeAgoLastShare', function() {
  return function(date) {
    var d = new Date(parseInt(date) * 1000).toISOString();
    return jQuery.timeago(d);
  }
});