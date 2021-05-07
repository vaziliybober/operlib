import { makeAtomic, applyAtomic, toStringAtomic } from './atomic.js';

export const makeOperation = (...aOperations) => aOperations;

export const composeOperations = (...operations) =>
  operations.reduce((acc, oper) => [...acc, ...oper], makeOperation());

export const applyOperation = (str, oper) =>
  oper.reduce((acc, aOper) => applyAtomic(acc, aOper), str);

export const toStringOperation = (oper) => {
  const insideBrackets = oper
    .map((aOper) => `  ${toStringAtomic(aOper)}`)
    .join('\n');
  return `[\n${insideBrackets}\n]`;
};

export const transformAtomic = (aOper1, aOper2) => {
  const useSymmetry = () => {
    const [aOper2Transformed, aOper1Transformed] = transformAtomic(
      aOper2,
      aOper1,
    );

    return [aOper1Transformed, aOper2Transformed];
  };

  if (aOper1.type === 'insert' && aOper2.type === 'insert') {
    const [pos1, pos2] = aOper1.data.pos <= aOper2.data.pos
      ? [aOper1.data.pos, aOper2.data.pos + aOper1.data.content.length]
      : [aOper1.data.pos + aOper2.data.content.length, aOper2.data.pos];

    return [
      makeOperation(
        makeAtomic('insert', {
          pos: pos1,
          content: aOper1.data.content,
        }),
      ),
      makeOperation(
        makeAtomic('insert', {
          pos: pos2,
          content: aOper2.data.content,
        }),
      ),
    ];
  }

  if (aOper1.type === 'remove' && aOper2.type === 'remove') {
    const left1 = aOper1.data.pos;
    const length1 = aOper1.data.length;
    const right1 = left1 + length1 - 1;

    const left2 = aOper2.data.pos;
    const length2 = aOper2.data.length;
    const right2 = left2 + length2 - 1;

    // aOper1 left, aOper2 right
    if (right1 < left2) {
      return [
        makeOperation(
          makeAtomic('remove', {
            pos: left1,
            length: length1,
          }),
        ),
        makeOperation(
          makeAtomic('remove', {
            pos: left2 - length1,
            length: length2,
          }),
        ),
      ];
    }

    // aOper2 left, aOper1 right
    if (right2 < left1) {
      return useSymmetry();
    }

    // aOper1 and aOper2 are intersected

    // aOper1 is more left, aOper2 is more right
    if (left1 <= left2 && right2 >= right1) {
      const intersectionLength = right1 - left2 + 1;
      return [
        makeOperation(
          makeAtomic('remove', {
            pos: left1,
            length: length1 - intersectionLength,
          }),
        ),
        makeOperation(
          makeAtomic('remove', {
            pos: right1 + 1 - length1,
            length: length2 - intersectionLength,
          }),
        ),
      ];
    }

    // aOper2 is more left, aOper1 is more right
    if (left2 <= left1 && right1 >= right2) {
      return useSymmetry();
    }

    // one is inside the other (and one is longer than the other)

    // aOper1 is bigger
    if (left1 <= left2 && right1 >= right2) {
      return [
        makeOperation(
          makeAtomic('remove', {
            pos: left1,
            length: length1 - length2,
          }),
        ),
        [],
      ];
    }

    // aOper2 is bigger
    if (left2 <= left1 && right2 >= right1) {
      return useSymmetry();
    }

    throw new Error('Unexpected case, need to fix');
  }

  if (aOper1.type === 'insert' && aOper2.type === 'remove') {
    const left = aOper2.data.pos;
    const { length } = aOper2.data;
    const right = left + length - 1;
    const { pos } = aOper1.data;
    const { content } = aOper1.data;

    if (pos <= left) {
      return [
        makeOperation(
          makeAtomic('insert', {
            pos,
            content,
          }),
        ),
        makeOperation(
          makeAtomic('remove', {
            pos: left + content.length,
            length,
          }),
        ),
      ];
    }

    if (pos > right) {
      return [
        makeOperation(
          makeAtomic('insert', {
            pos: pos - length,
            content,
          }),
        ),
        makeOperation(
          makeAtomic('remove', {
            pos: left,
            length,
          }),
        ),
      ];
    }

    if (pos > left && pos <= right) {
      const leftPartLength = pos - left;
      const rightPartLength = length - leftPartLength;
      return [
        makeOperation(
          makeAtomic('insert', {
            pos: left,
            content,
          }),
        ),
        makeOperation(
          makeAtomic('remove', {
            pos: left,
            length: leftPartLength,
          }),
          makeAtomic('remove', {
            pos: pos + content.length - leftPartLength,
            length: rightPartLength,
          }),
        ),
      ];
    }

    throw new Error('Unexpected case, need to fix');
  }

  if (aOper1.type === 'remove' && aOper2.type === 'insert') {
    return useSymmetry();
  }

  throw new Error(`Unsupported types: ${aOper1.type}-${aOper2.type}`);
};

export const transformOperations = (oper1, oper2) => {
  const operations1 = oper1.map((aOper1) => makeOperation(aOper1));
  const operations2 = oper2.map((aOper2) => makeOperation(aOper2));

  for (let i1 = 0; i1 < operations1.length; i1 += 1) {
    for (let i2 = 0; i2 < operations2.length; i2 += 1) {
      const o1 = operations1[i1];
      const o2 = operations2[i2];
      if (o1.length === 1 && o2.length === 1) {
        const a1 = o1[0];
        const a2 = o2[0];
        const [a1Transformed, a2Transformed] = transformAtomic(a1, a2);
        operations1[i1] = a1Transformed;
        operations2[i2] = a2Transformed;
      } else {
        const [o1Transformed, o2Transformed] = transformOperations(o1, o2);
        operations1[i1] = o1Transformed;
        operations2[i2] = o2Transformed;
      }
    }
  }

  const atomics1 = operations1.flat();
  const atomics2 = operations2.flat();

  return [makeOperation(...atomics1), makeOperation(...atomics2)];
};
