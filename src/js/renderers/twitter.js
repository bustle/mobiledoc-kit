
function TwitterRenderer() {}
TwitterRenderer.prototype.render = function(model) {
  return '<blockquote class="twitter-tweet"><a href="' + model.attributes.url + '"></a></blockquote>';
};

export default TwitterRenderer;
