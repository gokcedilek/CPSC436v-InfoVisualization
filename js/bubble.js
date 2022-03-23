// Code credit: https://bl.ocks.org/officeofjane/a70f4b44013d06b9c0a973f163d8ab7a
class BubbleDiagram {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
   constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      generalEventGroup: _config.parentElement.split("-")[2],
      className: 'bubble-diagram-' +  _config.generalEventGroup,
      containerWidth: 333,
      containerHeight: 500,
      margin: {top: 30, right: 30, bottom: 30, left: 30},
      tooltipPadding: 10,
      maxSize: 0,
      forceStrength: 0.03 // strength to apply to the position forces
    }
    this.fullData = _data;
    this.data = _data.filter((d) => d['GENERAL_EVENT_GROUP'] == this.config.generalEventGroup);
    this.initVis();
  }
  
    initVis() {
       let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .attr('class', vis.config.className)
            .attr("style", "outline: thin solid grey;");

        // Append group element that will contain our actual chart
        // and position it according to the given margin config
        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // location to centre the bubbles
        vis.centre = { x: vis.width/2, y: vis.height/2 };

        // these will be set in createNodes and chart functions
        vis.bubbles = null;

        // use max size in the data as the max in the scale's domain
        // note we have to ensure that size is a number
        const allGroupsSrc = d3.rollup(vis.fullData, v => v.length, d => d.GENERAL_EVENT_GROUP,d => d.SOURCE_SCALE)
        vis.allBubbles = this.createNodes(allGroupsSrc)
        const maxSize = d3.max(vis.allBubbles, d => +d.size);

        // size bubbles based on area
        vis.radiusScale = d3.scaleSqrt()
            .domain([0, maxSize])
            .range([0, 80])

        // set up colour scale
        vis.fillColour = d3.scaleOrdinal()
            .domain(["National", "Regional", "International", "Subnational","New Media", "Other"])
            .range(["#FF6B6B", "#FFD93D", "#39CCCC", "#3D9970", "#712B75","#AAAAAA"]);

        // Append axis title
        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', vis.width/2 + vis.config.margin.left)
            .attr('y', 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(this.config.generalEventGroup.replace('_',' '));

        this.updateVis()

    }

    createNodes(rawData) {

        let myNodes = [];
        rawData.forEach(element => {
            for (const [key, value] of element.entries()) {
                let node = {
                    name: key,
                    size: value,
                    x: Math.random() * 900,
                    y: Math.random() * 800
                }
                myNodes.push(node)
            }
        })

        return myNodes;
    }

    // charge is dependent on size of the bubble, so bigger towards the middle
    charge(d) {
        return Math.pow(d.size, 2.0) * 0.01
    }
  
    updateVis() {
      // Prepare data and scales
        let vis = this;
        let eventByGroupSrc = d3.rollup(vis.data, v => v.length, d => d.GENERAL_EVENT_GROUP,d => d.SOURCE_SCALE)
        vis.nodes = this.createNodes(eventByGroupSrc)

        // create a force simulation and add forces to it
        vis.simulation = d3.forceSimulation()
            .force('charge', d3.forceManyBody().strength(this.charge))
            // .force('center', d3.forceCenter(centre.x, centre.y))
            .force('x', d3.forceX().strength(vis.config.forceStrength).x(vis.centre.x))
            .force('y', d3.forceY().strength(vis.config.forceStrength).y(vis.centre.y))
            .force('collision', d3.forceCollide().radius(d => this.radiusScale(d.size) + 1));

        // force simulation starts up automatically, which we don't want as there aren't any nodes yet
        vis.simulation.stop();

        this.renderVis()
    }

    renderVis() {
        // Bind data to visual elements, update axes
        let vis = this;
        // bind nodes data to circle elements
        vis.bubbles = vis.svg.selectAll('.bubble')
                .data(vis.nodes, d => d.id)
            .join('circle')
                .classed('bubble', true)
                .attr('r', d => vis.radiusScale(d.size))
                .attr('fill', d => this.fillColour(d.name))
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)

        // set simulation's nodes to our newly created nodes array
        // simulation starts running automatically once nodes are set
        vis.simulation.nodes(vis.nodes)
            .on('tick', ticked)
            .restart();

        // callback function called after every tick of the force simulation
        // here we do the actual repositioning of the circles based on current x and y value of their bound node data
        // x and y values are modified by the force simulation
        function ticked() {
            vis.bubbles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)

        }

        /**
         * Add tooltip
         */

        vis.svg.selectAll('circle')
            .data(vis.nodes)
            .on('mouseover', (event,d) => {
                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(`
                    <p><b>${d.name}</b></p>
                    `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });

    }



}