import {Observable} from '../../Observable';
import {bufferTimeOrCount} from '../../operator/bufferTimeOrCount';

Observable.prototype.bufferTimeOrCount = bufferTimeOrCount;

export var _void: void;