module.exports = {
  throttle,
  debounce,
};

function throttle(fn, delay) {
  let throttled = false;
  return function () {
    if (!throttled) {
      fn.apply(this, arguments);
      throttled = true;
      setTimeout(() => {
        throttled = false;
      }, delay);
    }
  };
}

function debounce(fn, delay) {
  let timer;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}
