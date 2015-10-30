/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.sample', function () {
  it('should get samples when the notifier emits', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|          ');
    var e1subs =         '^                           !          ';
    var e2 =   hot(      '-----x----------x----------x----------|');
    var e2subs =         '^                           !          ';
    var expected =       '-----b----------d----------f|          ';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should sample nothing if source has not nexted yet', function () {
    var e1 =   hot('----a-^-------b----|');
    var e1subs =         '^            !';
    var e2 =   hot(      '-----x-------|');
    var e2subs =         '^            !';
    var expected =       '-------------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete when the notifier completes, nor should it emit', function () {
    var e1 =   hot('----a----b----c----d----e----f----');
    var e1subs =   '^                                 ';
    var e2 =   hot('------x-|                         ');
    var e2subs =   '^       !                         ';
    var expected = '------a---------------------------';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should complete only when the source completes, if notifier completes early', function () {
    var e1 =   hot('----a----b----c----d----e----f---|');
    var e1subs =   '^                                !';
    var e2 =   hot('------x-|                         ');
    var e2subs =   '^       !                         ';
    var expected = '------a--------------------------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should sample multiple times according to the notifier', function () {
    var e1 =   hot('----a----b----c----d----e----f----|  ');
    var e1subs =   '^                                 !  ';
    var e2 =   hot('------x-x------xx-x---x-------------|');
    var e2subs =   '^                                 !  ';
    var expected = '------a-a------cc-c---d-----------|  ';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if source raises error', function () {
    var e1 =   hot('----a-^--b----c----d----#                    ');
    var e1subs =         '^                 !                    ';
    var e2 =   hot(      '-----x----------x----------x----------|');
    var e2subs =         '^                 !                    ';
    var expected =       '-----b----------d-#                    ';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should completes if source does not emits', function () {
    var e1 =   hot('|');
    var e2 =   hot('------x-------|');
    var expected = '|';
    var e1subs =   '(^!)';
    var e2subs =   '(^!)';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if source throws immediately', function () {
    var e1 =   hot('#');
    var e2 =   hot('------x-------|');
    var expected = '#';
    var e1subs =   '(^!)';
    var e2subs =   '(^!)';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not completes if source does not complete', function () {
    var e1 =   hot('-');
    var e1subs =   '^              ';
    var e2 =   hot('------x-------|');
    var e2subs =   '^             !';
    var expected = '-';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should sample only until source completes', function () {
    var e1 =   hot('----a----b----c----d-|');
    var e1subs =   '^                    !';
    var e2 =   hot('-----------x----------x------------|');
    var e2subs =   '^                    !';
    var expected = '-----------b---------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should complete sampling if sample observable completes', function () {
    var e1 =   hot('----a----b----c----d-|');
    var e1subs =   '^                    !';
    var e2 =   hot('|');
    var e2subs =   '(^!)';
    var expected = '---------------------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});