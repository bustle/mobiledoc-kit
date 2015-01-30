
function LinkImageRenderer() {}
LinkImageRenderer.prototype.render = function(model) {
  return '<img src="' + model.attributes.thumbnail + '"/>';
};

export default LinkImageRenderer;
