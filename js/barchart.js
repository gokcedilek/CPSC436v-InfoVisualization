class BarChart {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 450,
      containerHeight: 250,
      margin: { top: 20, right: 30, bottom: 20, left: 100 },
      tooltipPadding: 5,
      textPadding: 1,
    };
    this.data = _data;
    this.initVis();
  }

  initVis() {
    let vis = this;

    // define chart dimensions
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // define SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg
      .append('g')
      .attr(
        'transform',
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // add chart titles
    vis.svg
      .append('text')
      .attr('class', 'axis-title')
      .attr('x', vis.config.margin.left - vis.config.margin.right)
      .attr('y', 4)
      .attr('dy', '.71em')
      .text('Fatalities (sum)');

    vis.chart
      .append('text')
      .attr('class', 'axis-title')
      .attr('y', vis.height - 5)
      .attr('x', vis.width + 25)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Year');

    // define scales and axes
    vis.yAxisScale = d3.scaleLinear().range([vis.height, 0]);
    vis.xAxisScale = d3.scaleBand().range([0, vis.width]).padding(0.1);
    vis.yAxis = d3
      .axisLeft(vis.yAxisScale)
      .ticks(5)
      .tickFormat((t) => t)
      .tickSizeOuter(0)
      .tickPadding(5);
    vis.xAxis = d3.axisBottom(vis.xAxisScale).tickSizeOuter(0).tickPadding(3);

    // define axis groups
    vis.xAxisGroup = vis.chart
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${vis.height})`);

    vis.yAxisGroup = vis.chart.append('g').attr('class', 'axis y-axis');

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // sort events by year
    vis.data.sort((a, b) => a.YEAR - b.YEAR);

    // compute number of fatalities by year
    vis.fatalitiesPerYear = d3.rollups(
      vis.data,
      (a) => d3.sum(a, (b) => b.FATALITIES),
      (b) => b.YEAR
    );

    // compute number of events by year
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

    // set dynamic axis and scale properties
    vis.yAxisScale.domain([0, maxFatalities]);
    vis.xAxisScale.domain(vis.fatalitiesPerYear.map((d) => d.year));
    vis.xAxis.ticks(numYears);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // append bar groups
    const barGroups = vis.chart
      .selectAll('.bar-group')
      .data(vis.fatalitiesPerYear)
      .join('g')
      .attr('class', 'bar-group');

    // append bars
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

    // append bar labels
    barGroups
      .selectAll('.bar-label')
      .data((d) => [d])
      .join('text')
      .attr('class', 'bar-label')
      .text((d) => d.fatalities)
      .attr('x', (d) => vis.xAxisScale(d.year))
      .attr('y', (d) => vis.yAxisScale(d.fatalities) - vis.config.textPadding)
      .style('font-size', 11);

    // render axes
    vis.xAxisGroup.call(vis.xAxis);
    vis.yAxisGroup.call(vis.yAxis);
  }
}
