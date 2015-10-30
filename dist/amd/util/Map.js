define(["require", "exports", './root', './MapPolyfill'], function (require, exports, root_1, MapPolyfill_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = root_1.root.Map || (function () { return MapPolyfill_1.default; })();
});
//# sourceMappingURL=Map.js.map