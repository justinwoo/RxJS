/**
Some credit for this helper goes to http://github.com/YuzuJS/setImmediate
*/
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _root = require('./root');

var ImmediateDefinition = (function () {
    function ImmediateDefinition(root) {
        _classCallCheck(this, ImmediateDefinition);

        this.root = root;
        if (root.setImmediate) {
            this.setImmediate = root.setImmediate;
            this.clearImmediate = root.clearImmediate;
        } else {
            this.nextHandle = 1;
            this.tasksByHandle = {};
            this.currentlyRunningATask = false;
            var doc = root.document;
            // Don't get fooled by e.g. browserify environments.
            if (this.canUseProcessNextTick()) {
                // For Node.js before 0.9
                this.setImmediate = this.createProcessNextTickSetImmediate();
            } else if (this.canUsePostMessage()) {
                // For non-IE10 modern browsers
                this.setImmediate = this.createPostMessageSetImmediate();
            } else if (this.canUseMessageChannel()) {
                // For web workers, where supported
                this.setImmediate = this.createMessageChannelSetImmediate();
            } else if (this.canUseReadyStateChange()) {
                // For IE 6–8
                this.setImmediate = this.createReadyStateChangeSetImmediate();
            } else {
                // For older browsers
                this.setImmediate = this.createSetTimeoutSetImmediate();
            }
            var ci = function clearImmediate(handle) {
                delete clearImmediate.instance.tasksByHandle[handle];
            };
            ci.instance = this;
            this.clearImmediate = ci;
        }
    }

    ImmediateDefinition.prototype.identify = function identify(o) {
        return this.root.Object.prototype.toString.call(o);
    };

    ImmediateDefinition.prototype.canUseProcessNextTick = function canUseProcessNextTick() {
        return this.identify(this.root.process) === '[object process]';
    };

    ImmediateDefinition.prototype.canUseMessageChannel = function canUseMessageChannel() {
        return Boolean(this.root.MessageChannel);
    };

    ImmediateDefinition.prototype.canUseReadyStateChange = function canUseReadyStateChange() {
        var document = this.root.document;
        return Boolean(document && 'onreadystatechange' in document.createElement('script'));
    };

    ImmediateDefinition.prototype.canUsePostMessage = function canUsePostMessage() {
        var root = this.root;
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `root.postMessage` means something completely different and can't be used for this purpose.
        if (root.postMessage && !root.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = root.onmessage;
            root.onmessage = function () {
                postMessageIsAsynchronous = false;
            };
            root.postMessage('', '*');
            root.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
        return false;
    };

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.

    ImmediateDefinition.prototype.partiallyApplied = function partiallyApplied(handler) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var fn = function result() {
            var handler = result.handler;
            var args = result.args;

            if (typeof handler === 'function') {
                handler.apply(undefined, args);
            } else {
                new Function('' + handler)();
            }
        };
        fn.handler = handler;
        fn.args = args;
        return fn;
    };

    ImmediateDefinition.prototype.addFromSetImmediateArguments = function addFromSetImmediateArguments(args) {
        this.tasksByHandle[this.nextHandle] = this.partiallyApplied.apply(undefined, args);
        return this.nextHandle++;
    };

    ImmediateDefinition.prototype.createProcessNextTickSetImmediate = function createProcessNextTickSetImmediate() {
        var fn = function setImmediate() {
            var named = setImmediate;
            var _named$instance = named.instance;
            var root = _named$instance.root;
            var addFromSetImmediateArguments = _named$instance.addFromSetImmediateArguments;
            var partiallyApplied = _named$instance.partiallyApplied;
            var runIfPresent = _named$instance.runIfPresent;

            var handle = addFromSetImmediateArguments(arguments);
            root.process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
        fn.instance = this;
        return fn;
    };

    ImmediateDefinition.prototype.createPostMessageSetImmediate = function createPostMessageSetImmediate() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
        var root = this.root;
        var runIfPresent = this.runIfPresent;
        var messagePrefix = 'setImmediate$' + root.Math.random() + '$';
        var onGlobalMessage = function onGlobalMessage(event) {
            if (event.source === root && typeof event.data === 'string' && event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };
        root.addEventListener('message', onGlobalMessage, false);
        var fn = function setImmediate() {
            var messagePrefix = setImmediate.messagePrefix;
            var _setImmediate$instance = setImmediate.instance;
            var root = _setImmediate$instance.root;
            var addFromSetImmediateArguments = _setImmediate$instance.addFromSetImmediateArguments;

            var handle = addFromSetImmediateArguments(arguments);
            root.postMessage(messagePrefix + handle, '*');
            return handle;
        };
        fn.instance = this;
        fn.messagePrefix = messagePrefix;
        return fn;
    };

    ImmediateDefinition.prototype.runIfPresent = function runIfPresent(handle) {
        // From the spec: 'Wait until any invocations of this algorithm started before this one have completed.'
        // So if we're currently running a task, we'll need to delay this invocation.
        if (this.currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // 'too much recursion' error.
            this.root.setTimeout(this.partiallyApplied(this.runIfPresent, handle), 0);
        } else {
            var task = this.tasksByHandle[handle];
            if (task) {
                this.currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    this.clearImmediate(handle);
                    this.currentlyRunningATask = false;
                }
            }
        }
    };

    ImmediateDefinition.prototype.createMessageChannelSetImmediate = function createMessageChannelSetImmediate() {
        var _this = this;

        var channel = new this.root.MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            _this.runIfPresent(handle);
        };
        var fn = function setImmediate() {
            var channel = setImmediate.channel;
            var instance = setImmediate.instance;

            var handle = instance.addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
        fn.channel = channel;
        fn.instance = this;
        return fn;
    };

    ImmediateDefinition.prototype.createReadyStateChangeSetImmediate = function createReadyStateChangeSetImmediate() {
        var fn = function setImmediate() {
            var instance = setImmediate.instance;
            var root = instance.root;
            var runIfPresent = instance.runIfPresent;
            var addFromSetImmediateArguments = instance.addFromSetImmediateArguments;

            var doc = root.document;
            var html = doc.documentElement;
            var handle = instance.addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement('script');
            script.onreadystatechange = function () {
                instance.runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
        fn.instance = this;
        return fn;
    };

    ImmediateDefinition.prototype.createSetTimeoutSetImmediate = function createSetTimeoutSetImmediate() {
        var fn = function setImmediate() {
            var instance = setImmediate.instance;
            var runIfPresent = instance.runIfPresent;
            var partiallyApplied = instance.partiallyApplied;
            var root = instance.root;

            var handle = instance.addFromSetImmediateArguments(arguments);
            root.setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
        fn.instance = this;
        return fn;
    };

    return ImmediateDefinition;
})();

exports.ImmediateDefinition = ImmediateDefinition;
var Immediate = new ImmediateDefinition(_root.root);
exports.Immediate = Immediate;
//# sourceMappingURL=Immediate.js.map
//# sourceMappingURL=Immediate.js.map