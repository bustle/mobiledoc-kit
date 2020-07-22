import placeholderImageSrc from '../utils/placeholder-image-src'

interface ImagePayload {
  src?: string
}

export default {
  name: 'image',
  type: 'dom',

  render({ payload }: { payload: ImagePayload }) {
    let img = document.createElement('img')
    img.src = payload.src || placeholderImageSrc
    return img
  },
}
