class TimeSlider {

    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
     constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: 1000,
        containerHeight: 50,
        margin: {top: 30, right: 30, bottom: 30, left: 30},
        tooltipPadding: 10
      }
      this.data = _data;
      this.initVis();
    }
  
      initVis() {
        // Create SVG area, initialize scales and axes
        let vis = this;
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        const data = [2015, 2016, 2017, 2018, 2019, 2020, 2022]
        const startDate = '2015'
        const endDate = '2022'
        
            
      //   const sliderRange = d3
      //   .sliderBottom()
      //   .min(d3.min(data))
      //   .max(d3.max(data))
      //   .width(300)
      //   .tickFormat(d3.format('.2%'))
      //   .ticks(5)
      //   .default([0.015, 0.02])
      //   .fill('#2196f3')
      //   .on('onchange', val => {
      //     d3.select('p#value-range').text(val.map(d3.format('.2%')).join('-'));
      //   });
    
      // const gRange = d3
      //   .select('div#slider-range')
      //   .append('svg')
      //   .attr('width', 500)
      //   .attr('height', 100)
      //   .append('g')
      //   .attr('transform', 'translate(30,30)');
    
      // gRange.call(sliderRange);
    
      // d3.select('p#value-range').text(
      //   sliderRange
      //     .value()
      //     .map(d3.format('.2%'))
      //     .join('-')
      // );
    
        this.updateVis();
      }
    
      updateVis() {
        
        // Prepare data and scales
        this.renderVis();
      }
    
      renderVis() {
        // Bind data to visual elements, update axes
      }
    
    } 