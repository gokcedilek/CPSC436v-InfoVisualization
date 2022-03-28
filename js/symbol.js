class SymbolMap {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
   constructor(_config, _data, _geoData) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 500,
      containerHeight: 350,
      margin: {top: 30, right: 30, bottom: 30, left: 30},
      tooltipPadding: 10,
      projection: d3.geoConicConformal()
    }
    this.data = _data;
    this.geoData = _geoData;
    this.initVis();
  }

    initVis() {
      let vis = this;
      // Create SVG area, initialize scales and axes
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);

      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

      vis.projection = d3.geoConicConformal().center([50, 25])
          .scale([vis.width/2*(Math.PI)])           // scale to fit size of svg group
          .translate([vis.width/2, vis.height/2]);  // ensure centered within svg group
      
      vis.geoPath = d3.geoPath().projection(vis.projection);
      vis.symbolScale = d3.scaleSqrt()
      .range([1, 2]);
      console.log(vis.symbolScale(1));
      console.log(vis.symbolScale(50));
      this.updateVis();
    }
  
    updateVis() {
      let vis = this;
      // Prepare data and scales
      vis.dataLocation = d3.group(vis.data, d => d.LOCATION);

      
      this.renderVis();
      
    }
  
    renderVis() {
      let vis = this;
      // Bind data to visual elements, update axes
      // Convert compressed TopoJSON to GeoJSON format
      const geoPath = vis.chart.selectAll('.geo-path')
          .data(topojson.feature(vis.geoData, vis.geoData.objects.countries).features)
          .join('path')
          .attr('class', 'geo-path')
          .attr('d', vis.geoPath);

      // Append country borders
      const geoBoundaryPath = vis.chart.selectAll('.geo-boundary-path')
          .data([topojson.mesh(vis.geoData, vis.geoData.objects.countries)])
          .join('path')
          .attr('class', 'geo-boundary-path')
          .attr('d', vis.geoPath);

      // Append symbols
      const geoSymbols = vis.chart.selectAll('.geo-symbol')
      .data(vis.dataLocation)
      .join('circle')
        .attr('class', 'geo-symbol')
        .attr('r', d => vis.symbolScale(d[1].length))
        // d is [[location name, [array of events that happened in that location]], ...]
        // d[1][0] = the first event in that location
        .attr('cx', d => vis.projection([d[1][0].LONGITUDE,d[1][0].LATITUDE])[0])
        .attr('cy', d => vis.projection([d[1][0].LONGITUDE,d[1][0].LATITUDE])[1]);


      // // Tooltip event listeners
      geoSymbols
          .on('mousemove', (event, d) => {
            d3.select('#symbol-tooltip')
              .style('display', 'block')
              .style('left', `${event.pageX + vis.config.tooltipPadding}px`)   
              .style('top', `${event.pageY + vis.config.tooltipPadding}px`)
              .html(`
                <div>${d[0]}, ${d[1][0].COUNTRY}</div>
                <div>Number of events: ${d[1].length}</div>
              `);
          })
          .on('mouseleave', () => {
            d3.select('#symbol-tooltip').style('display', 'none');
          });
    }
  
  } 