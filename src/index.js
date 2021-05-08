import {
  makeOperation,
  applyOperation,
  transformOperations,
  composeOperations,
  toStringOperation,
} from './operation.js';

import { makeAtomic } from './atomic.js';

export default {
  make: makeOperation,
  makeAtomic,
  apply: applyOperation,
  transform: transformOperations,
  compose: composeOperations,
  toString: toStringOperation,
};
