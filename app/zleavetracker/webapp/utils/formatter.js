sap.ui.define([], function () {
    'use strict';
    return {
        startDateManipulation: function (sDate) {
            var sDate = new Date(sDate);
            var newStarttime = sDate.getTime() - Math.abs(sDate.getTimezoneOffset() * 60 * 1000);
            var newStartDate = new Date(newStarttime);
            return newStartDate;
        },
        endDateManipulation: function (eDate) {
            var eDate = new Date(eDate);
            var newEndtime = eDate.getTime() - Math.abs(eDate.getTimezoneOffset() * 60 * 1000);
            var newEndDate = new Date(newEndtime);
            return newEndDate;
        }
    }
});