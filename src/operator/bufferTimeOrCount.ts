import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';
import {asap} from '../scheduler/asap';

/**
 * Buffers values from the source for a specific time span or until the buffer size is met.
 * Unlike bufferTime or bufferCount, bufferTimeOrCount has one buffer at most at a time.
 *
 * @param {number} bufferTimeSpan the amount of time to fill the buffer before emitting
 * @param {number} bufferSize the maximum size of the buffer emitted
 * @param {Scheduler} [scheduler] (optional, defaults to `asap` scheduler) The
 * scheduler on which to schedule the intervals that determine buffer
 * boundaries.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export function bufferTimeOrCount<T>(bufferTimeSpan: number,
                                     bufferSize: number,
                                     scheduler: Scheduler = asap): Observable<T[]> {
  return this.lift(new BufferTimeOrCountOperator(bufferTimeSpan, bufferSize, scheduler));
}

class BufferTimeOrCountOperator<T> implements Operator<T, T[]> {
  constructor(private bufferTimeSpan: number,
              private bufferSize: number,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T[]>): Subscriber<T> {
    return new BufferTimeOrCountSubscriber(
      subscriber, this.bufferTimeSpan, this.bufferSize, this.scheduler
    );
  }
}

class BufferTimeOrCountSubscriber<T> extends Subscriber<T> {
  private buffer: T[] = [];
  private timeSpanSub: Subscription;

  constructor(destination: Subscriber<T[]>,
              private bufferTimeSpan: number,
              private bufferSize: number,
              private scheduler: Scheduler) {
    super(destination);
    this.createSubscription();
  }

  protected _next(value: T) {
    this.buffer.push(value);
    if (this.buffer.length >= this.bufferSize) {
      this.timeSpanSub.unsubscribe();
      this.flushBuffer();
    }
  }

  protected _complete() {
    this.flushBuffer();
    super._complete();
  }

  flushBuffer() {
    this.destination.next(this.buffer);
    this.buffer = [];
    this.createSubscription();
  }

  createSubscription() {
    this.timeSpanSub = this.scheduler.schedule(this.flushBuffer.bind(this), this.bufferTimeSpan);
  }
}