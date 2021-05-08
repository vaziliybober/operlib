import {
  makeOperation,
  applyOperation,
  transformOperations,
  composeOperations,
  toStringOperation,
} from './operation.js';

import { makeAtomic } from './atomic.js';

export {
  makeOperation as make,
  makeAtomic,
  applyOperation as apply,
  transformOperations as transform,
  composeOperations as compose,
  toStringOperation as toString,
};
