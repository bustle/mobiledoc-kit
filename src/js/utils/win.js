import { doc } from 'content-kit-compiler';

var win;
if (typeof window !== 'undefined') {
  win = window;
} else {
  // jsdom provides a defaultView
  win = doc.defaultView;
}

export default win;
