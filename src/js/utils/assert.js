import MobiledocError from './mobiledoc-error';

export default function(message, conditional) {
  if (!conditional) {
    throw new MobiledocError(message);
  }
}
