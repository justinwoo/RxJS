/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions, rxTestScheduler, time */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.bufferTimeOrCount', function () {
  it.asDiagram('bufferTimeOrCount(100, 2)')('should emit buffers at interval or count', function () {
    var e1 =   hot('---a--------c---d-------f--------|');
    var subs =     '^                                !';
    var t = time(  '----------|');
    var count = 2;
    var expected = '----------w-----x---------y------(z|)';
    var values = {
      w: ['a'],
      x: ['c','d'],
      y: ['f'],
      z: []
    };

    var result = e1.bufferTimeOrCount(t, count, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit buffers but handle source ending with an error', function () {
    var e1 =   hot('---a--------c---d-------f--------#');
    var t = time(  '----------|');
    var count = 2;
    var expected = '----------w-----x---------y------#';
    var values = {
      w: ['a'],
      x: ['c','d'],
      y: ['f']
    };

    var result = e1.bufferTimeOrCount(t, count, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
  });

  it('should emit buffers and allow result to unsubscribed early', function () {
    var e1 = hot('--1--^2--3---4---5--6--7---8----9------------|');
    var unsub =       '                 !                       ';
    var subs =        '^                !                       ';
    var t = time(     '----------|');
    var expected =    '----------a------                        ';
    var values = {
      a: ['2', '3', '4']
    };

    var result = e1.bufferTimeOrCount(t, 5, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 = hot('--1--^2--3---4---5--6--7---8----9------------|');
    var subs =        '^               !                        ';
    var t = time(     '----------|');
    var expected =    '----------a------                        ';
    var unsub =       '                !                        ';
    var values = {
      a: ['2', '3', '4']
    };

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .bufferTimeOrCount(t, 5, rxTestScheduler)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle empty', function () {
    var e1 = cold( '|');
    var e1subs =   '(^!)';
    var expected = '(b|)';
    var values = { b: [] };
    var t = time('----------|');

    var result = e1.bufferTimeOrCount(t, 5, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', function () {
    var e1 = cold('-');
    var unsub =    '                                            !';
    var t = time(  '----------|');
    var expected = '----------a---------a---------a---------a----';

    var result = e1.bufferTimeOrCount(t, 5, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, { a: [] });
  });

  it('should handle throw', function () {
    var e1 = Observable.throw(new Error('haha'));
    var expected = '#';
    var t = time('----------|');

    var result = e1.bufferTimeOrCount(t, 5, rxTestScheduler);

    expectObservable(result).toBe(expected, undefined, new Error('haha'));
  });

  it('should handle errors', function () {
    var e1 =   hot('---a---b---c---#');
    var e1subs =   '^              !';
    var t = time(  '----------|');
    var expected = '----------w----#';
    var values = {
      w: ['a','b']
    };

    var result = e1.bufferTimeOrCount(t, 5, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});