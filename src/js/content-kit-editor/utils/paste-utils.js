import { RegEx } from '../constants';

function plainTextToBlocks(plainText, tag) {
  var blocks = plainText.split(RegEx.NEWLINE),
      len = blocks.length,
      block, openTag, closeTag, content, i;
  if(len < 2) {
    return plainText;
  } else {
    content = '';
    openTag = '<' + tag + '>';
    closeTag = '</' + tag + '>';
    for(i = 0; i < len; ++i) {
      block = blocks[i];
      if(block !== '') {
        content += openTag + block + closeTag;
      }
    }
    return content;
  }
}

function cleanPastedContent(event, defaultBlockTag) {
  event.preventDefault();
  var data = event.clipboardData, plainText;
  if(data && data.getData) {
    plainText = data.getData('text/plain');
    return plainTextToBlocks(plainText, defaultBlockTag);
  }
}

export { cleanPastedContent };
