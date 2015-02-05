
function InstagramRenderer() {}
InstagramRenderer.prototype.render = function(model) {
  return '<img src="' + model.attributes.url + '"/>';
};

export default InstagramRenderer;
