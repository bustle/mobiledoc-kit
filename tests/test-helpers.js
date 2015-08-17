import registerAssertions from './helpers/assertions';
registerAssertions();

import DOMHelpers from './helpers/dom';
import ToolbarHelpers from './helpers/toolbar';
import skipInPhantom from './helpers/skip-in-phantom';
import MobiledocHelpers from './helpers/mobiledoc';

export default {
  dom: DOMHelpers,
  toolbar: ToolbarHelpers,
  skipInPhantom,
  mobiledoc: MobiledocHelpers
};
