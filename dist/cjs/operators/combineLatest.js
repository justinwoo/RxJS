'use strict';

exports.__esModule = true;
exports['default'] = combineLatest;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _observablesArrayObservable = require('../observables/ArrayObservable');

var _observablesArrayObservable2 = _interopRequireDefault(_observablesArrayObservable);

var _combineLatestSupport = require('./combineLatest-support');

/**
 * Combines the values from this observable with values from observables passed as arguments. This is done by subscribing
 * to each observable, in order, and collecting an array of each of the most recent values any time any of the observables
 * emits, then either taking that array and passing it as arguments to an option `project` function and emitting the return
 * value of that, or just emitting the array of recent values directly if there is no `project` function.
 * @param {...Observable} observables the observables to combine the source with
 * @param {function} [project] an optional function to project the values from the combined recent values into a new value for emission.
 * @returns {Observable} an observable of other projected values from the most recent values from each observable, or an array of each of
 * the most recent values from each observable.
 */

function combineLatest() {
    for (var _len = arguments.length, observables = Array(_len), _key = 0; _key < _len; _key++) {
        observables[_key] = arguments[_key];
    }

    observables.unshift(this);
    var project = undefined;
    if (typeof observables[observables.length - 1] === 'function') {
        project = observables.pop();
    }
    return new _observablesArrayObservable2['default'](observables).lift(new _combineLatestSupport.CombineLatestOperator(project));
}

//# sourceMappingURL=combineLatest.js.map
module.exports = exports['default'];
//# sourceMappingURL=combineLatest.js.map