'use strict';

exports.__esModule = true;
exports['default'] = concat;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

var _schedulersImmediate = require('../schedulers/immediate');

var _schedulersImmediate2 = _interopRequireDefault(_schedulersImmediate);

/**
 * Joins multiple observables together by subscribing to them one at a time and merging their results
 * into the returned observable. Will wait for each observable to complete before moving on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */

function concat() {
    var scheduler = _schedulersImmediate2['default'];

    for (var _len = arguments.length, observables = Array(_len), _key = 0; _key < _len; _key++) {
        observables[_key] = arguments[_key];
    }

    var args = observables;
    if (typeof args[observables.length - 1].schedule === 'function') {
        scheduler = args.pop();
        args.push(1, scheduler);
    }
    return _Observable2['default'].fromArray(observables).mergeAll(1);
}

//# sourceMappingURL=concat-static.js.map
module.exports = exports['default'];
//# sourceMappingURL=concat-static.js.map