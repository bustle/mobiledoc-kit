import MobiledocError from './mobiledoc-error'

export default function (message: string, conditional: boolean) {
  if (!conditional) {
    throw new MobiledocError(message)
  }
}
