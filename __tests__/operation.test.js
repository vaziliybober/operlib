import { makeAtomic, applyAtomic } from '../src/atomic.js';
import {
  makeOperation,
  transformOperations,
  applyOperation,
} from '../src/operation.js';

const genRandInt = (from, to) => from + Math.floor((to - from) * Math.random());

const genRandString = (length) => {
  const symbols = 'qwertyuiopasdfghjklzxcvbnm1234567890';
  const result = [];

  for (let i = 0; i < length; i += 1) {
    result.push(symbols[genRandInt(0, symbols.length)]);
  }

  return result.join('');
};

const chooseRandomly = (arr) => {
  const i = genRandInt(0, arr.length);
  return arr[i];
};

const iterationsCount = 10000;

const minStrLength = 10;
const maxStrLength = 15;
const types = ['insert', 'remove'];
const maxOperSize = 20;
const maxContentLength = 8;

const genRandOperation = (str) => {
  const operSize = genRandInt(0, maxOperSize);
  const atomicOperations = [];
  let currentStr = str;

  const genRandAtomicOperation = (type) => {
    if (type === 'insert') {
      const pos = genRandInt(0, currentStr.length + 1);
      const contentLength = genRandInt(1, maxContentLength);
      const content = genRandString(contentLength);
      return makeAtomic('insert', { pos, content });
    }

    if (type === 'remove') {
      const pos = genRandInt(0, currentStr.length + 1);
      const length = genRandInt(1, currentStr.length - pos + 1);
      return makeAtomic('remove', { pos, length });
    }

    throw new Error('Unknown type');
  };

  for (let j = 0; j < operSize; j += 1) {
    const type = chooseRandomly(types);
    const newAtomicOperation = genRandAtomicOperation(type);
    atomicOperations.push(newAtomicOperation);
    currentStr = applyAtomic(currentStr, newAtomicOperation);
  }

  return makeOperation(...atomicOperations);
};

it('insert-insert-random', () => {
  for (let i = 0; i < iterationsCount; i += 1) {
    const length = genRandInt(minStrLength, maxStrLength + 1);
    const str = genRandString(length);
    const oper1 = genRandOperation(str);
    const oper2 = genRandOperation(str);

    // console.log('---------------');
    // console.log(str);
    // console.log(oper1.toString());
    // console.log(oper2.toString());
    const [oper1Transformed, oper2Transformed] = transformOperations(
      oper1,
      oper2,
    );
    // console.log(oper1Transformed.toString());
    // console.log(oper2Transformed.toString());
    expect(
      applyOperation(applyOperation(str, oper2), oper1Transformed),
    ).toEqual(applyOperation(applyOperation(str, oper1), oper2Transformed));
  }
});
