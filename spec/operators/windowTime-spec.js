/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.windowTime', function () {
  it('should emit windows given windowTimeSpan', function () {
    var source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    var subs =               '^                          !';
    //  100 frames            0---------1---------2------|
    var expected =           'x---------y---------z------|';
    var x = cold(            '---a--b--c|                 ');
    var y = cold(                      '--d--e--f-|       ');
    var z = cold(                                '-g--h--|');
    var values = { x: x, y: y, z: z };

    var result = source.windowTime(100, null, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval', function () {
    var source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    var subs =               '^                          !';
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    var expected =           'x---------y---------z------|';
    var x = cold(            '---a-|                      ');
    var y = cold(                      '--d--(e|)         ');
    var z = cold(                                '-g--h|  ');
    var values = { x: x, y: y, z: z };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return a single empty window if source is empty', function () {
    var source =   cold('|');
    var expected =      '(w|)';
    var w =         cold('|');
    var expectedValues = { w: w };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, expectedValues);
  });

  it('should split a Just source into a single window identical to source', function () {
    var source =   cold('(a|)');
    var expected =      '(w|)';
    var w =         cold('(a|)');
    var expectedValues = { w: w };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, expectedValues);
  });

  it('should be able to split a never Observable into timely empty windows', function () {
    var source =    hot('^-----------');
    var unsub =         '           !';
    var expected =      'a--b--c--d--';
    var a =        cold('---|        ');
    var b =        cold(   '---|     ');
    var c =        cold(      '---|  ');
    var d =        cold(         '---');
    var expectedValues = { a: a, b: b, c: c, d: d };

    var result = source.windowTime(30, 30, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, expectedValues);
  });

  it('should emit an error-only window if outer is a simple throw-Observable', function () {
    var source =   cold('#');
    var expected =      '(w#)';
    var w =         cold('#');
    var expectedValues = { w: w };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, expectedValues);
  });

  it('should handle source Observable which eventually emits an error', function () {
    var source = hot('--1--2--^--a--b--c--d--e--f--g--h--#');
    var subs =               '^                          !';
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    var expected =           'x---------y---------z------#';
    var x = cold(            '---a-|                      ');
    var y = cold(                      '--d--(e|)         ');
    var z = cold(                                '-g--h|  ');
    var values = { x: x, y: y, z: z };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval, ' +
  'but outer is unsubscribed early', function () {
    var source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    var unsub =              '              !             ';
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    var expected =           'x---------y----             ';
    var x = cold(            '---a-|                      ');
    var y = cold(                      '--d--             ');
    var values = { x: x, y: y };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, values);
  });
});