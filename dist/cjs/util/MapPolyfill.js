"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapPolyfill = (function () {
    function MapPolyfill() {
        _classCallCheck(this, MapPolyfill);

        this.size = 0;
        this._values = [];
        this._keys = [];
    }

    //# sourceMappingURL=MapPolyfill.js.map

    MapPolyfill.prototype.get = function get(key) {
        var i = this._keys.indexOf(key);
        return i === -1 ? undefined : this._values[i];
    };

    MapPolyfill.prototype.set = function set(key, value) {
        var i = this._keys.indexOf(key);
        if (i === -1) {
            this._keys.push(key);
            this._values.push(value);
            this.size++;
        } else {
            this._values[i] = value;
        }
        return this;
    };

    MapPolyfill.prototype["delete"] = function _delete(key) {
        var i = this._keys.indexOf(key);
        if (i === -1) {
            return false;
        }
        this._values.splice(i, 1);
        this._keys.splice(i, 1);
        this.size--;
        return true;
    };

    MapPolyfill.prototype.forEach = function forEach(cb, thisArg) {
        for (var i = 0; i < this.size; i++) {
            cb.call(thisArg, this._values[i], this._keys[i]);
        }
    };

    return MapPolyfill;
})();

exports["default"] = MapPolyfill;
module.exports = exports["default"];
//# sourceMappingURL=MapPolyfill.js.map