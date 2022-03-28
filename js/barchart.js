class BarChart {
  constructor(_config, _data, sourceActor, targetActor) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 300,
      containerHeight: 250,
      margin: { top: 20, right: 30, bottom: 20, left: 50 },
      tooltipPadding: 5,
      textPadding: 1,
    };
    this.data = _data;
    this.sourceActor = sourceActor;
    this.targetActor = targetActor;
    this.initVis();
  }

  initVis() {
    let vis = this;

    const tooltipSVG = d3
      .select(vis.config.parentElement)
      .append('svg')
      .attr('id', 'chord-tooltip-svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.tooltipSVGChart = tooltipSVG
      .append('g')
      .attr(
        'transform',
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    tooltipSVG
      .append('text')
      .attr('class', 'axis-title')
      .attr('x', 4)
      .attr('y', 4)
      .attr('dy', '.71em')
      .text('Fatalities (sum)');

    vis.tooltipSVGChart
      .append('text')
      .attr('class', 'axis-title')
      .attr('y', vis.height - 10)
      .attr('x', vis.width + 30)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Year');

    // tooltipSVG
    //   .append('text')
    //   .attr('class', 'chart-title')
    //   .attr('x', 120)
    //   .attr('y', 4)
    //   .attr('dy', '.71em')
    //   .text(`${vis.sourceActor} - ${vis.targetActor}`);

    vis.fatalitiesPerYear = d3.rollups(
      vis.data,
      (a) => d3.sum(a, (b) => b.FATALITIES),
      (b) => b.YEAR
    );

    vis.eventsPerYear = d3.rollups(
      vis.data,
      (a) => a.length,
      (b) => b.YEAR
    );

    vis.fatalitiesPerYear = vis.fatalitiesPerYear.map(([year, fatalities]) => ({
      year,
      fatalities,
    }));
    const minYear = vis.fatalitiesPerYear[0].year;
    const maxYear =
      vis.fatalitiesPerYear[vis.fatalitiesPerYear.length - 1].year;
    const maxFatalities = Math.max(
      100,
      d3.max(vis.fatalitiesPerYear, (d) => d.fatalities)
    );

    const numYears = maxYear - minYear + 1;

    vis.yAxisScale = d3
      .scaleLinear()
      .domain([0, maxFatalities])
      .range([vis.height, 0]);
    vis.xAxisScale = d3
      .scaleBand()
      .domain(vis.fatalitiesPerYear.map((d) => d.year))
      .range([0, vis.width])
      .padding(0.1);
    vis.yAxis = d3
      .axisLeft(vis.yAxisScale)
      .ticks(5)
      .tickFormat((t) => t)
      .tickSizeOuter(0)
      .tickPadding(5);
    vis.xAxis = d3
      .axisBottom(vis.xAxisScale)
      .ticks(numYears)
      .tickSizeOuter(0)
      .tickPadding(3);

    vis.xAxisGroup = vis.tooltipSVGChart
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${vis.height})`);

    vis.yAxisGroup = vis.tooltipSVGChart
      .append('g')
      .attr('class', 'axis y-axis');

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const barGroups = vis.tooltipSVGChart
      .selectAll('.bar-group')
      .data(vis.fatalitiesPerYear)
      .join('g')
      .attr('class', 'bar-group');

    barGroups
      .selectAll('.bar')
      .data((d) => [d])
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => vis.xAxisScale(d.year))
      .attr('width', vis.xAxisScale.bandwidth())
      .attr('height', (d) => vis.height - vis.yAxisScale(d.fatalities))
      .attr('y', (d) => vis.yAxisScale(d.fatalities))
      .attr('fill', '#d1d7de');

    barGroups
      .selectAll('.bar-label')
      .data((d) => [d])
      .join('text')
      .attr('class', 'bar-label')
      .text((d) => d.fatalities)
      .attr('x', (d) => vis.xAxisScale(d.year))
      .attr('y', (d) => vis.yAxisScale(d.fatalities) - vis.config.textPadding)
      .style('font-size', 11);

    vis.xAxisGroup.call(vis.xAxis);
    vis.yAxisGroup.call(vis.yAxis);
  }
}
