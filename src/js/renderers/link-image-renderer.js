
function LinkImageRenderer() {}
LinkImageRenderer.prototype.render = function(model) {
  return '<a href="' + model.attributes.url + '" target="_blank"><img src="' + model.attributes.thumbnail + '"/></a>';
};

export default LinkImageRenderer;
