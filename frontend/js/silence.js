// silence.js — must be loaded first in <head> on every page
// Disables all console output in production to prevent data/token leakage
(function () {
    var isProduction = (
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
    );
    if (isProduction) {
        var noop = function () {};
        console.log   = noop;
        console.warn  = noop;
        console.debug = noop;
        console.info  = noop;
        console.group = noop;
        console.groupEnd = noop;
        console.groupCollapsed = noop;
        console.table = noop;
        console.dir   = noop;
        // Keep console.error so real crashes are still visible
    }
})();
