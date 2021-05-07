import { makeAtomic, applyAtomic } from '../src/atomic.js';
import { applyOperation, transformAtomic } from '../src/operation.js';

const checkTransform = (str, a1, a2, expectedResult) => {
  const [a1t, a2t] = transformAtomic(a1, a2);

  expect(applyOperation(applyAtomic(str, a1), a2t)).toEqual(expectedResult);
  expect(applyOperation(applyAtomic(str, a2), a1t)).toEqual(expectedResult);
};

describe('atomicTransform', () => {
  it('insert-insert', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('insert', { pos: 1, content: '123' });
    const a2 = makeAtomic('insert', { pos: 2, content: '456' });
    checkTransform(str, a1, a2, 'a123b456cdefgh');
  });
  it('delete-delete: 1 left, 2 right', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('remove', { pos: 1, length: 2 });
    const a2 = makeAtomic('remove', { pos: 5, length: 3 });
    checkTransform(str, a1, a2, 'ade');
  });
  it('delete-delete: 2 left, 1 right', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('remove', { pos: 5, length: 3 });
    const a2 = makeAtomic('remove', { pos: 1, length: 2 });
    checkTransform(str, a1, a2, 'ade');
  });
  it('delete-delete: 1 more left, 2 more right', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('remove', { pos: 1, length: 3 });
    const a2 = makeAtomic('remove', { pos: 2, length: 4 });
    checkTransform(str, a1, a2, 'agh');
  });
  it('delete-delete: 2 more left, 1 more right', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('remove', { pos: 2, length: 4 });
    const a2 = makeAtomic('remove', { pos: 1, length: 3 });
    checkTransform(str, a1, a2, 'agh');
  });
  it('delete-delete: 1 is bigger', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('remove', { pos: 1, length: 6 });
    const a2 = makeAtomic('remove', { pos: 3, length: 3 });
    checkTransform(str, a1, a2, 'ah');
  });
  it('insert-delete: left-right', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('insert', { pos: 1, content: '+-' });
    const a2 = makeAtomic('remove', { pos: 1, length: 3 });
    checkTransform(str, a1, a2, 'a+-efgh');
  });
  it('delete-insert: right-left', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('remove', { pos: 1, length: 3 });
    const a2 = makeAtomic('insert', { pos: 1, content: '+-' });
    checkTransform(str, a1, a2, 'a+-efgh');
  });
  it('insert-delete: right-left', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('insert', { pos: 5, content: '+-' });
    const a2 = makeAtomic('remove', { pos: 1, length: 3 });
    checkTransform(str, a1, a2, 'ae+-fgh');
  });
  it('delete-insert: left-right', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('remove', { pos: 1, length: 3 });
    const a2 = makeAtomic('insert', { pos: 5, content: '+-' });
    checkTransform(str, a1, a2, 'ae+-fgh');
  });
  it('insert-delete: insert between', () => {
    const str = 'abcdefgh';
    const a1 = makeAtomic('insert', { pos: 3, content: '+-' });
    const a2 = makeAtomic('remove', { pos: 1, length: 6 });
    checkTransform(str, a1, a2, 'a+-h');
  });
});
