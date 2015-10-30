'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _root = require('./root');

var _MapPolyfill = require('./MapPolyfill');

var _MapPolyfill2 = _interopRequireDefault(_MapPolyfill);

exports['default'] = _root.root.Map || (function () {
  return _MapPolyfill2['default'];
})();

//# sourceMappingURL=Map.js.map
module.exports = exports['default'];
//# sourceMappingURL=Map.js.map