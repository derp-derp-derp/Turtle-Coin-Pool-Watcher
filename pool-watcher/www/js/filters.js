'use strict';

angular.module('tc.filters', [])

.filter('getReadableHashRateString', ['$filter', function ($filter) {
    return function (hashrate) {
		var i = 0;
		var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH' ];

		while (hashrate > 1000) {
			hashrate = hashrate / 1000;
			i++;
		}

        return hashrate.toFixed(2) + byteUnits[i];
    };
}]);