// Code credit: https://bl.ocks.org/officeofjane/a70f4b44013d06b9c0a973f163d8ab7a
class BubbleDiagram {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _dispatcher, _data) {
    this.config = {
      parentElement: _config.parentElement,
      generalEventGroup: _config.parentElement.split('-')[2],
      className: 'bubble-diagram-' + _config.generalEventGroup,
      containerWidth: 350,
      containerHeight: 350,
      margin: { top: 50, right: 30, bottom: 50, left: 30 },
      tooltipPadding: 10,
      maxSize: 0,
      forceStrength: 0.03, // strength to apply to the position forces
    };
    this.fullData = _data; // the entire dataset
    this.data = _data.filter(
      (d) => d['GENERAL_EVENT_GROUP'] == this.config.generalEventGroup
    ); // data specific to the event group of interest
    this.radius_min = 4;
    this.radius_max = 80;
    this.dispatcher = _dispatcher;
    this.selectedActor = 0;
    this.filteredData = []; // data after filtering by the chord diagram
    this.selectedBubble = '';
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight)
      .attr('class', vis.config.className);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chartArea = vis.svg
      .append('g')
      .attr(
        'transform',
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // location to centre the bubbles
    vis.centre = { x: vis.width / 2, y: vis.height / 2 };

    // use max size in the data as the max in the scale's domain
    // note we have to ensure that size is a number
    const allGroupsSrc = d3.rollup(
      vis.fullData,
      (v) => v.length,
      (d) => d.GENERAL_EVENT_GROUP,
      (d) => d.SOURCE_SCALE
    );
    vis.allBubbles = this.createNodes(allGroupsSrc);
    vis.event_num_max = d3.max(vis.allBubbles, (d) => +d.size);
    vis.event_num_min = d3.min(vis.allBubbles, (d) => +d.size);

    // set up colour scale
    vis.fillColour = d3
      .scaleOrdinal()
      .domain([
        'Regional',
        'International',
        'National',
        'Subnational',
        'New media',
        'Local partner',
        'Other',
      ])
      .range([
        '#FF6B6B',
        '#FFD93D',
        '#4350fa',
        '#3D9970',
        '#c300eb',
        '#8BDB81',
        '#AAAAAA',
      ]);

    // Append axis title
    vis.svg
      .append('text')
      .attr('class', 'axis-title')
      .attr('x', vis.width / 2 + vis.config.margin.left)
      .attr('y', vis.config.containerHeight - vis.config.margin.bottom / 2)
      .attr('dy', '.71em')
      .attr('font-weight', 'bold')
      .style('font-size', '1.5em')
      .style('text-anchor', 'middle')
      .text(this.config.generalEventGroup.replace(/_/g, ' '));

    this.updateVis();
  }

  createNodes(rawData) {
    let myNodes = [];
    rawData.forEach((element) => {
      for (const [key, value] of element.entries()) {
        let node = {
          name: key,
          size: value,
          x:
            Math.random() * 333 + // 333 is chosen as it's a bit smaller than the size of the svg
            this.radiusScale(value) +
            2 * this.config.margin.left,
          y:
            Math.random() * 333 +
            this.radiusScale(value) +
            2 * this.config.margin.top,
        };
        myNodes.push(node);
      }
    });

    return myNodes;
  }

  radiusScale(d) {
    let vis = this;

    d = Math.sqrt(d);
    let min = Math.sqrt(vis.event_num_min);
    let max = Math.sqrt(vis.event_num_max);
    let radius =
      vis.radius_min +
      ((d - min) / (max - min)) * (vis.radius_max - vis.radius_min);
    return radius;
  }

  // charge is dependent on size of the bubble, so that we can position bigger circles towards the middle
  charge(d) {
    let forceSize = this.radiusScale(d.size);
    return Math.pow(forceSize, 2.0) * 0.001;
  }

  updateVis() {
    // Prepare data and scales
    let vis = this;

    if (vis.selectedActor === 0) {
      vis.filteredData = vis.data;
    } else {
      vis.filteredData = vis.data.filter((d) => d.INTER1 === vis.selectedActor);
    }
    console.log('actor: ', vis.selectedActor, ' filter:', vis.filteredData);

    let eventByGroupSrc = d3.rollup(
      vis.filteredData,
      (v) => v.length,
      (d) => d.GENERAL_EVENT_GROUP,
      (d) => d.SOURCE_SCALE
    );
    vis.nodes = this.createNodes(eventByGroupSrc);

    // create a force simulation and add forces to it to have the bigger circles at the middle
    vis.simulation = d3
      .forceSimulation()
      .force('charge', d3.forceManyBody().strength(this.charge(vis)))
      // .force('center', d3.forceCenter(centre.x, centre.y))
      .force(
        'x',
        d3.forceX().strength(vis.config.forceStrength).x(vis.centre.x)
      )
      .force(
        'y',
        d3.forceY().strength(vis.config.forceStrength).y(vis.centre.y)
      )
      .force(
        'collision',
        d3.forceCollide().radius((d) => this.radiusScale(d.size) + 1) // to prevent bubbles overlapping each other
      );

    // force simulation starts up automatically, which we don't want as there aren't any nodes yet
    vis.simulation.stop();

    this.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;
    // bind nodes data to circle elements
    vis.bubbles = vis.svg
      .selectAll('.bubble')
      .data(vis.nodes, (d) => d.id)
      .join('circle')
      .classed('bubble', true)
      .attr('r', (d) => vis.radiusScale(d.size))
      .attr('fill', (d) => this.fillColour(d.name))
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .classed('active', (d) => vis.selectedBubble === d.y)
      .on('click', function (event, d) {
        const isActive = d3.select(this).classed('active');
        d3.select(this).classed('active', !isActive).style('stroke-width', 3);
        if (isActive) {
          vis.selectedBubble = '';
          vis.dispatcher.call('filteredInfoSourceEvent', event, '', '');
        } else {
          // Get the names of all active/filtered categories
          // Call dispatcher and pass the event name, D3 event object,
          // and our custom event data (selected category names)
          const selectedEvents = vis.config.generalEventGroup;
          const selectedInfoSource = vis.svg
            .selectAll('.bubble.active')
            .data()[0]['name'];
          console.log('d: ', d);
          vis.selectedBubble = d.y;
          vis.dispatcher.call(
            'filteredInfoSourceEvent',
            event,
            selectedEvents,
            selectedInfoSource
          );
        }
      });

    // set simulation's nodes to our newly created nodes array
    vis.simulation.nodes(vis.nodes).on('tick', ticked).restart();

    // callback function called after every tick of the force simulation
    // the force simulation in the simulation will be used to reposition the x and y
    function ticked() {
      vis.bubbles.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    }

    /**
     * Add tooltip
     */

    vis.svg
      .selectAll('circle')
      .data(vis.nodes)
      .on('mouseover', (event, d) => {
        d3
          .select('#tooltip')
          .style('display', 'block')
          .style('left', event.pageX + vis.config.tooltipPadding + 'px')
          .style('top', event.pageY + vis.config.tooltipPadding + 'px').html(`
                    <p>Information source: <b>${d.name}</b></p>
                    <p>Number of events: <b>${d.size}</b></p>
                    `);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });
  }
}
