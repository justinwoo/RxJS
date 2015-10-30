/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.last()', function () {
  it('should take the last value of an observable', function () {
    var e1 = hot('--a--^--b--c--|');
    var expected =    '---------(c|)';
    expectObservable(e1.last()).toBe(expected);
  });

  it('should error on nothing sent but completed', function () {
    var e1 = hot('--a--^----|');
    var expected =    '-----#';
    expectObservable(e1.last()).toBe(expected, null, new Rx.EmptyError());
  });

  it('should error on empty', function () {
    var e1 = Observable.empty();
    var expected = '#';
    expectObservable(e1.last()).toBe(expected, null, new Rx.EmptyError());
  });

  it('should go on forever on never', function () {
    var e2 = Observable.never();
    var expected = '----';
    expectObservable(e2.last()).toBe(expected);
  });

  it('Should return last element matches with predicate', function () {
    var e1 =    hot('--a--b--a--b--|');
    var expected =  '--------------(b|)';

    var predicate = function (value) {
      return value === 'b';
    };

    expectObservable(e1.last(predicate)).toBe(expected);
  });

  it('should return a default value if no element found', function () {
    var e1 = Observable.empty();
    var expected = '(a|)';
    expectObservable(e1.last(null, null, 'a')).toBe(expected);
  });

  it('should not return default value if an element is found', function () {
    var e1 = hot('--a---^---b---c---d---|');
    var expected =     '----------------(d|)';
    expectObservable(e1.last(null, null, 'x')).toBe(expected);
  });

  it('should support a result selector argument', function () {
    var e1 = hot('--a--^---b---c---d---e--|');
    var expected =    '-------------------(x|)';
    var predicate = function (x) { return x === 'c'; };
    var resultSelector = function (x, i) {
      expect(i).toBe(1);
      expect(x).toBe('c');
      return 'x';
    };
    expectObservable(e1.last(predicate, resultSelector)).toBe(expected);
  });

  it('should raise error when predicate throws', function () {
    var e1 = hot('--a--^---b---c---d---e--|');
    var expected =    '--------#';
    var predicate = function (x) {
      if (x === 'c') {
        throw 'error';
      } else {
        return false;
      }
    };

    expectObservable(e1.last(predicate)).toBe(expected);
  });

  it('should raise error when result selector throws', function () {
    var e1 = hot('--a--^---b---c---d---e--|');
    var expected =    '--------#';
    var predicate = function (x) { return x === 'c'; };
    var resultSelector = function (x, i) {
      throw 'error';
    };

    expectObservable(e1.last(predicate, resultSelector)).toBe(expected);
  });
});