export const debounce = (func, wait) => {
  let timeoutId;

  return (...args) => {
    const later = () => {
      clearTimeout(timeoutId);
      func(...args);
    };

    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);
  };
};
