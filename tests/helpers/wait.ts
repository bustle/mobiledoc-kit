let wait = (callback: FrameRequestCallback) => {
  window.requestAnimationFrame(callback)
}

export default wait
