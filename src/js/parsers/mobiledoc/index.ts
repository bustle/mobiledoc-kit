import MobiledocParser_0_2 from './0-2'
import MobiledocParser_0_3 from './0-3'
import MobiledocParser_0_3_1 from './0-3-1'
import MobiledocParser_0_3_2 from './0-3-2'

import { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_2, MobiledocV0_2 } from '../../renderers/mobiledoc/0-2'
import { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_3, MobiledocV0_3 } from '../../renderers/mobiledoc/0-3'
import { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_3_1, MobiledocV0_3_1 } from '../../renderers/mobiledoc/0-3-1'
import { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_3_2, MobiledocV0_3_2 } from '../../renderers/mobiledoc/0-3-2'
import { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_3_3, MobiledocV0_3_3 } from '../../renderers/mobiledoc/0-3-3'

import assert from '../../utils/assert'
import PostNodeBuilder from '../../models/post-node-builder'
import Post from '../../models/post'

type Mobiledoc = MobiledocV0_2 | MobiledocV0_3 | MobiledocV0_3_1 | MobiledocV0_3_2 | MobiledocV0_3_3

export default {
  parse(builder: PostNodeBuilder, mobiledoc: Mobiledoc): Post {
    switch (mobiledoc.version) {
      case MOBILEDOC_VERSION_0_2:
        return new MobiledocParser_0_2(builder).parse(mobiledoc)
      case MOBILEDOC_VERSION_0_3:
        return new MobiledocParser_0_3(builder).parse(mobiledoc)
      case MOBILEDOC_VERSION_0_3_1:
        return new MobiledocParser_0_3_1(builder).parse(mobiledoc)
      case MOBILEDOC_VERSION_0_3_2:
      case MOBILEDOC_VERSION_0_3_3:
        return new MobiledocParser_0_3_2(builder).parse(mobiledoc as any)
      default:
        assert(`Unknown version of mobiledoc parser requested: ${(mobiledoc as any).version}`, false)
    }
  },
}
