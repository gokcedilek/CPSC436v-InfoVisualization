class ChordDiagram {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
   constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 500,
      margin: {top: 30, right: 30, bottom: 30, left: 30},
      tooltipPadding: 10
    }
    this.data = _data;
    this.initVis();
  }
  
    initVis() {
      // Create SVG area, initialize scales and axes
      this.updateVis();
    }
  
    updateVis() {
      // Prepare data and scales
    }
  
    renderVis() {
      // Bind data to visual elements, update axes
    }
  
  } 