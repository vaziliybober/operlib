const insert = (str, pos, content) =>
  str.substr(0, pos) + content + str.substr(pos);

const remove = (str, pos, length = 1) =>
  str.substr(0, pos) + str.substr(pos + length);

const appliers = {
  insert: (str, { pos, content }) => insert(str, pos, content),
  remove: (str, { pos, length }) => remove(str, pos, length),
};

export const makeAtomic = (type, data) => ({ type, data });

export const applyAtomic = (str, aOper) => {
  const { type, data } = aOper;
  return appliers[type](str, data);
};

export const toStringAtomic = (aOper) => {
  const { type, data } = aOper;
  return `${type}: ${JSON.stringify(data)}`;
};
