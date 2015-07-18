import Post from 'content-kit-editor/models/post';
import SectionParser from 'content-kit-editor/parsers/section';
import { forEach } from 'content-kit-editor/utils/array-utils';

export default {
  parse(element) {
    const post = new Post();

    forEach(element.childNodes, child => {
      post.appendSection(SectionParser.parse(child));
    });

    return post;
  }
};
