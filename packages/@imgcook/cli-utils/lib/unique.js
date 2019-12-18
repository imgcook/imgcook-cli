// Filter array duplicates.
exports.unique = array => {
  return array
    .concat()
    .sort()
    .filter((item, index, arr) => {
      return !index || item !== arr[index - 1];
    });
};
