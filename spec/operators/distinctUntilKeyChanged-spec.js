/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.distinctUntilKeyChanged()', function () {
  it('should distinguish between values', function () {
    var values = {a: {val: 1}, b: {val: 2}};
    var e1 =   hot('--a--a--a--b--b--a--|', values);
    var expected = '--a--------b-----a--|';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected, values);
  });

  it('should distinguish between values and does not completes', function () {
    var values = {a: {val: 1}, b: {val: 2}};
    var e1 =   hot('--a--a--a--b--b--a-', values);
    var expected = '--a--------b-----a-';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected, values);
  });

  it('should distinguish between values with key', function () {
    var values = {a: {val: 1}, b: {valOther: 1}, c: {valOther: 3}, d: {val: 1}, e: {val: 5}};
    var e1 =   hot('--a--b--c--d--e--|', values);
    var expected = '--a--b-----d--e--|';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected, values);
  });

  it('should not compare if source does not have element with key', function () {
    var values = {a: {valOther: 1}, b: {valOther: 1}, c: {valOther: 3}, d: {valOther: 1}, e: {valOther: 5}};
    var e1 =   hot('--a--b--c--d--e--|', values);
    var expected = '--a--------------|';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected, values);
  });

  it('should not completes if source never completes', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected);
  });

  it('should not completes if source does not completes', function () {
    var e1 = hot('-');
    var expected = '-';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected);
  });

  it('should complete if source is empty', function () {
    var e1 = Observable.empty();
    var expected = '|';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected);
  });

  it('should complete if source does not emit', function () {
    var e1 =   hot('------|');
    var expected = '------|';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected);
  });

  it('should emit if source emits single element only', function () {
    var values = {a: {val: 1}};
    var e1 =   hot('--a--|', values);
    var expected = '--a--|';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected, values);
  });

  it('should emit if source is scalar', function () {
    var values = {a: {val: 1}};
    var e1 = Observable.of(values.a);
    var expected = '(a|)';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected, values);
  });

  it('should raises error if source raises error', function () {
    var values = {a: {val: 1}};
    var e1 =   hot('--a--a--#', values);
    var expected = '--a-----#';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected, values);
  });

  it('should raises error if source throws', function () {
    var e1 = Observable.throw('error');
    var expected = '#';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected);
  });

  it('should not omit if source elements are all different', function () {
    var values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    var e1 =   hot('--a--b--c--d--e--|', values);
    var expected = '--a--b--c--d--e--|';

    expectObservable(e1.distinctUntilKeyChanged('val')).toBe(expected, values);
  });

  it('should emit once if source elements are all same', function () {
    var values = {a: {val: 1}};
    var e1 =   hot('--a--a--a--a--a--a--|', values);
    var expected = '--a-----------------|';

    expectObservable(e1.distinctUntilChanged()).toBe(expected, values);
  });

  it('should emit once if comparer returns true always regardless of source emits', function () {
    var values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    var e1 =   hot('--a--b--c--d--e--|', values);
    var expected = '--a--------------|';

    expectObservable(e1.distinctUntilKeyChanged('val', function () { return true; })).toBe(expected, values);
  });

  it('should emit all if comparer returns false always regardless of source emits', function () {
    var values = {a: {val: 1}};
    var e1 =   hot('--a--a--a--a--a--a--|', values);
    var expected = '--a--a--a--a--a--a--|';

    expectObservable(e1.distinctUntilKeyChanged('val', function () { return false; })).toBe(expected, values);
  });

  it('should distinguish values by selector', function () {
    var values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    var e1 =   hot('--a--b--c--d--e--|', values);
    var expected = '--a-----c-----e--|';
    var selector = function (x, y) {
      return y % 2 === 0;
    };

    expectObservable(e1.distinctUntilKeyChanged('val', selector)).toBe(expected, values);
  });

  it('should raises error when comparer throws', function () {
    var values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    var e1 =   hot('--a--b--c--d--e--|', values);
    var expected = '--a--b--c--#';
    var selector = function (x, y) {
      if (y === 4) {
        throw 'error';
      }
      return x === y;
    };

    expectObservable(e1.distinctUntilKeyChanged('val', selector)).toBe(expected, values);
  });
});