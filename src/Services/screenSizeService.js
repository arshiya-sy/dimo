export default new ScreenSize();
function ScreenSize() {
  var androidApiCalls = require('../Services/androidApiCallsService');

  this.getScreenDimension = (function () {
    var getDimension = function () {
      return JSON.parse(androidApiCalls.getScreenDimensions());
    }
    return getDimension;
  })();

  this.setScreenDimension = function (element) {
    this.setScreenHeight(element, 1);
    this.setScreenWidth(element, 1);
  }

  this.setScreenHeight = function (element, ratio) {
    ratio = ratio || 1;
    var dimensions = this.getScreenDimension();
    var view_height = dimensions.viewHeight || dimensions.height;
    var bodyHeight = (view_height / dimensions.scaledDensity) * ratio;
    document.documentElement.style.height = bodyHeight + 'px';
  }

  /**
  * Function to set the complete height instead of the visible height
  * @param {DOM} element    - Element on which the height is to be applied
  * @param {Number} ratio   - Ratio to be applied (optional)
  */
  this.setFullScreenHeight = function (element, ratio) {
    ratio = ratio || 1;
    var fullResolution = true;
    var dimensions = this.getScreenDimension();
    var view_height = dimensions.height;
    if (dimensions.viewHeight && (dimensions.height - dimensions.viewHeight) < 300) {
      view_height = dimensions.viewHeight;
      fullResolution = false;
    }
    var bodyHeight = (view_height / dimensions.scaledDensity) * ratio;
    if (typeof (bodyHeight) === "number") {
      bodyHeight = Math.ceil(bodyHeight)
    }
    document.documentElement.style.height = bodyHeight + 'px';
    return fullResolution;
  }

  this.setScreenWidth = function (element, ratio) {
    ratio = ratio || 1;
    var dimensions = this.getScreenDimension();
    var view_width = dimensions.viewWidth || dimensions.width;
    var bodyWidth = (view_width / dimensions.scaledDensity) * ratio;
    document.documentElement.style.width = bodyWidth + 'px';
  }
}