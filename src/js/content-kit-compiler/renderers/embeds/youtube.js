
var RegExVideoId = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;

function getVideoIdFromUrl(url) {
  var match = url.match(RegExVideoId);
  if (match && match[1].length === 11){
    return match[1];
  }
  return null;
}

function YouTubeRenderer() {}
YouTubeRenderer.prototype.render = function(model) {
  var videoId = getVideoIdFromUrl(model.attributes.url);
  var embedUrl = 'http://www.youtube.com/embed/' + videoId + '?controls=2&showinfo=0&color=white&theme=light';
  return '<iframe width="100%" height="400" frameborder="0" allowfullscreen src="' + embedUrl + '"></iframe>';
};

export default YouTubeRenderer;