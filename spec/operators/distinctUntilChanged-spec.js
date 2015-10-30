/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.distinctUntilChanged()', function () {
  it('should distinguish between values', function () {
    var e1 =   hot('--a--a--a--b--b--a--|');
    var expected = '--a--------b-----a--|';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should distinguish between values and does not completes', function () {
    var e1 =   hot('--a--a--a--b--b--a-');
    var expected = '--a--------b-----a-';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should not completes if source never completes', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should not completes if source does not completes', function () {
    var e1 = hot('-');
    var expected = '-';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should complete if source is empty', function () {
    var e1 = Observable.empty();
    var expected = '|';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should complete if source does not emit', function () {
    var e1 =   hot('------|');
    var expected = '------|';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should emit if source emits single element only', function () {
    var e1 =   hot('--a--|');
    var expected = '--a--|';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should emit if source is scalar', function () {
    var e1 = Observable.of('a');
    var expected = '(a|)';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should raises error if source raises error', function () {
    var e1 =   hot('--a--a--#');
    var expected = '--a-----#';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should raises error if source throws', function () {
    var e1 = Observable.throw('error');
    var expected = '#';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should not omit if source elements are all different', function () {
    var e1 =   hot('--a--b--c--d--e--f--|');
    var expected = '--a--b--c--d--e--f--|';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should emit once if source elements are all same', function () {
    var e1 =   hot('--a--a--a--a--a--a--|');
    var expected = '--a-----------------|';

    expectObservable(e1.distinctUntilChanged()).toBe(expected);
  });

  it('should emit once if comparer returns true always regardless of source emits', function () {
    var e1 =   hot('--a--b--c--d--e--f--|');
    var expected = '--a-----------------|';

    expectObservable(e1.distinctUntilChanged(function () { return true; })).toBe(expected);
  });

  it('should emit all if comparer returns false always regardless of source emits', function () {
    var e1 =   hot('--a--a--a--a--a--a--|');
    var expected = '--a--a--a--a--a--a--|';

    expectObservable(e1.distinctUntilChanged(function () { return false; })).toBe(expected);
  });

  it('should distinguish values by selector', function () {
    var e1 =   hot('--a--b--c--d--e--f--|', {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
    var expected = '--a-----c-----e-----|';
    var selector = function (x, y) {
      return y % 2 === 0;
    };

    expectObservable(e1.distinctUntilChanged(selector)).toBe(expected, {a: 1, c: 3, e: 5});
  });

  it('should raises error when comparer throws', function () {
    var e1 =   hot('--a--b--c--d--e--f--|');
    var expected = '--a--b--c--#';
    var selector = function (x, y) {
      if (y === 'd') {
        throw 'error';
      }
      return x === y;
    };

    expectObservable(e1.distinctUntilChanged(selector)).toBe(expected);
  });
});