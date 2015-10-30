'use strict';

exports.__esModule = true;
exports['default'] = count;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilBindCallback = require('../util/bindCallback');

var _utilBindCallback2 = _interopRequireDefault(_utilBindCallback);

/**
 * Returns an observable of a single number that represents the number of items that either:
 * Match a provided predicate function, _or_ if a predicate is not provided, the number
 * represents the total count of all items in the source observable. The count is emitted
 * by the returned observable when the source observable completes.
 * @param {function} [predicate] a boolean function to select what values are to be counted.
 * it is provided with arguments of:
 *   - `value`: the value from the source observable
 *   - `index`: the "index" of the value from the source observable
 *   - `source`: the source observable instance itself.
 * @param {any} [thisArg] the optional `this` context to use in the `predicate` function
 * @returns {Observable} an observable of one number that represents the count as described
 * above
 */

function count(predicate, thisArg) {
    return this.lift(new CountOperator(predicate, thisArg, this));
}

var CountOperator = (function () {
    function CountOperator(predicate, thisArg, source) {
        _classCallCheck(this, CountOperator);

        this.predicate = predicate;
        this.thisArg = thisArg;
        this.source = source;
    }

    CountOperator.prototype.call = function call(subscriber) {
        return new CountSubscriber(subscriber, this.predicate, this.thisArg, this.source);
    };

    return CountOperator;
})();

var CountSubscriber = (function (_Subscriber) {
    _inherits(CountSubscriber, _Subscriber);

    function CountSubscriber(destination, predicate, thisArg, source) {
        _classCallCheck(this, CountSubscriber);

        _Subscriber.call(this, destination);
        this.thisArg = thisArg;
        this.source = source;
        this.count = 0;
        this.index = 0;
        if (typeof predicate === 'function') {
            this.predicate = _utilBindCallback2['default'](predicate, thisArg, 3);
        }
    }

    //# sourceMappingURL=count.js.map

    CountSubscriber.prototype._next = function _next(value) {
        var predicate = this.predicate;
        var passed = true;
        if (predicate) {
            passed = _utilTryCatch2['default'](predicate)(value, this.index++, this.source);
            if (passed === _utilErrorObject.errorObject) {
                this.destination.error(passed.e);
                return;
            }
        }
        if (passed) {
            this.count += 1;
        }
    };

    CountSubscriber.prototype._complete = function _complete() {
        this.destination.next(this.count);
        this.destination.complete();
    };

    return CountSubscriber;
})(_Subscriber3['default']);

module.exports = exports['default'];
//# sourceMappingURL=count.js.map