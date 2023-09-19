export const getCurrentDate = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const isBoolHasValue = (value) => {
  if (!value) {
    return false;
  }

  const temp = JSON.stringify(value);
  return temp.length > 0;
};

export const isString = (value) => {
  return Object.prototype.toString.call(value) === "[object String]";
};
