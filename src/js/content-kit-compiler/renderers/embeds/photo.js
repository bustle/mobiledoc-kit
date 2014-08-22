
function PhotoEmbedRenderer() {}
PhotoEmbedRenderer.prototype.render = function(model) {
  return '<img src="' + model.attributes.url + '"/>';
};

export default PhotoEmbedRenderer;
