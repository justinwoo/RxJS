/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Promise = require('promise');

describe('Observable.prototype.expand()', function () {
  it('should map and recursively flatten', function () {
    var values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    var e1 = hot('(a|)', values);
    /*
      expectation explanation: (conjunction junction?) ...

      since `cold('---(z|)')` emits `x + x` and completes on frame 30
      but the next "expanded" return value is synchronously subscribed to in
      that same frame, it stacks like so:

      a
      ---(b|)
         ---(c|)
            ---(d|)
               ---(e|)      (...which flattens into:)
      a--b--c--d--(e|)
    */
    var expected = 'a--b--c--d--(e|)';

    expectObservable(e1.expand(function (x) {
      if (x === 16) {
        return Observable.empty();
      }
      return cold('---(z|)', { z: x + x });
    })).toBe(expected, values);
  });

  it('should map and recursively flatten with scalars', function () {
    var values = {
      a: 1,
      b: 1 + 1, // a + a,
      c: 2 + 2, // b + b,
      d: 4 + 4, // c + c,
      e: 8 + 8, // d + d
    };
    var e1 = hot('(a|)', values);
    var expected = '(abcde|)';

    expectObservable(e1.expand(function (x) {
      if (x === 16) {
        return Observable.empty();
      }
      return Observable.of(x + x); // scalar
    })).toBe(expected, values);
  });

  it('should recursively flatten promises', function (done) {
    var expected = [1, 2, 4, 8, 16];
    Observable.of(1)
      .expand(function (x) {
        if (x === 16) {
          return Observable.empty();
        }
        return Promise.resolve(x + x);
      })
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, function () {
        expect(expected.length).toBe(0);
        done();
      });
  });

  it('should recursively flatten Arrays', function (done) {
    var expected = [1, 2, 4, 8, 16];
    Observable.of(1)
      .expand(function (x) {
        if (x === 16) {
          return Observable.empty();
        }
        return [x + x];
      })
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, function () {
        expect(expected.length).toBe(0);
        done();
      });
  });

  it('should recursively flatten lowercase-o observables', function (done) {
    var expected = [1, 2, 4, 8, 16];

    Observable.of(1)
      .expand(function (x) {
        if (x === 16) {
          return Observable.empty();
        }

        var ish = {
          subscribe: function (observer) {
            observer.next(x + x);
            observer.complete();
          }
        };

        ish[Symbol.observable] = function () { return this; };
        return ish;
      })
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, function () {
        expect(expected.length).toBe(0);
        done();
      });
  });
});