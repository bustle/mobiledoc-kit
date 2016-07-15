let wait = (callback) => {
  window.requestAnimationFrame(callback);
};

export default wait;
