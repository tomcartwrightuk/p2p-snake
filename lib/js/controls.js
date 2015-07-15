var defaultDir = "right"
module.exports.direction = defaultDir
var $ = require('jquery');
var directionRules = {
  up: 'down',
  left: 'right',
  right: 'left',
  down: 'up'
}

module.exports.setup = function() {
  var self = this;

  $(document).keydown(function(e) {
    var key = e.which;
    var d;
    switch(key) {
      case 37:
        d = "left";
        e.preventDefault();
        break;
      case 38:
        d = "up"
        e.preventDefault();
        break;
      case 39:
        d = "right";
        e.preventDefault();
        break;
      case 40:
        d = "down";
        e.preventDefault();
    }
    setDirection(d)
  })

  $('.control-wrapper').on('click', function(e) {
    var d = module.exports.direction
    var newD = $(this).context.id;
    setDirection(newD)
  })
}

module.exports.reset = function() {
  module.exports.direction = defaultDir;
}

function setDirection(newD) {
  var d = module.exports.direction
  if (d !== directionRules[newD]) {
    module.exports.direction = newD;
  }
}
