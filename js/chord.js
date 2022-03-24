class ChordDiagram {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 500,
      margin: { top: 30, right: 30, bottom: 30, left: 30 },
      tooltipPadding: 5,
    };
    this.data = _data;
    // this.data = this.data.slice(0, 10000);
    this.selectedActor = 0;
    this.dispatcher = _dispatcher;
    this.interCodeMap = {
      0: 'Undefined',
      1: 'State Forces',
      2: 'Rebel Groups',
      3: 'Political Militias',
      4: 'Identity Militias',
      5: 'Rioters',
      6: 'Protesters',
      7: 'Civilians',
      8: 'External/Other Forces',
    };

    // change opacity
    this.chordColors = [
      '#fc928b',
      '#07a822',
      // '#41b2ba',
      '#5276f7',
      '#ae94d4',
      '#dbaa09',
      '#b0b305',
      '#f3b6fa',
      '#48a4f0',
    ];
    this.initVis();
  }

  initVis() {
    // Create SVG area, initialize scales and axes
    let vis = this;

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

    // vis.chart = vis.svg
    //   .append('g')
    //   .attr(
    //     'transform',
    //     `translate(${vis.config.margin.left},${vis.config.margin.top})`
    //   );
    vis.chart = vis.svg.append('g').attr('transform', `translate(250,250)`);

    vis.barChartTooltip = d3
      .tip()
      .attr('class', 'bar-chart-tooltip')
      .offset([20, 120])
      .html('<div id="bar-chart-div"></div>');

    vis.chart.call(vis.barChartTooltip);

    this.updateVis();
  }

  updateVis() {
    let vis = this;
    // Prepare data and scales

    let matrix = new Array();
    for (let row = 0; row < 8; row++) {
      matrix[row] = new Array();
      for (let col = 0; col < 8; col++) {
        const events = vis.data.filter(
          (data) => data.INTER1 == row + 1 && data.INTER2 == col + 1
        );
        matrix[row][col] = events.length;
      }
    }
    vis.matrix = matrix;

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;
    const chordData = d3.chord().padAngle(0.05)(vis.matrix);

    const textId = { id: 0, href: new URL('#0', window.location) };
    vis.chart
      .append('path')
      .attr('id', textId.id)
      .attr('fill', 'none')
      .attr(
        'd',
        d3.arc()({ outerRadius: 210, startAngle: 0, endAngle: 2 * Math.PI })
      );

    // const filteredGroupData =
    //   vis.selectedActor === 0
    //     ? chordData.groups
    //     : chordData.groups.filter((d) => d.index + 1 === vis.selectedActor);
    // console.log('filtered groups: ', filteredGroupData);

    const chordNodeGroup = vis.chart
      // .append('g')
      // .join('g')
      .selectAll('.chord-node')
      .data(chordData.groups)
      // .data(filteredGroupData)
      .join('g')
      .attr('class', 'chord-node');

    const chordNodes = chordNodeGroup
      .append('path')
      .attr('fill', (_, i) => vis.chordColors[i])
      .attr('stroke', 'black')
      .attr('d', (_, i) => {
        const startAngle = i * 45;
        const endAngle = (i + 1) * 45;
        console.log(`i: ${i}, start: ${startAngle}, end: ${endAngle}`);
        return d3
          .arc()
          .innerRadius(200)
          .outerRadius(210)
          .startAngle((i) => i * 45)
          .endAngle((i) => (i + 1) * 45);
      })
      .attr('id', (_, i) => 'chord-node-id' + i);

    chordNodeGroup
      .append('text')
      // .attr('dx', 3)
      .attr('dy', (d, i) => {
        if (d.value < 700) {
          if (i % 2 == 0) {
            return -20;
          } else {
            return -5;
          }
        } else {
          return -5;
        }
      })
      .attr('font-size', '0.65em')
      .append('textPath')
      // .attr('textLength', 40)
      .attr('xlink:href', function (d) {
        // return '#chord-node-id' + d.index;
        return textId.href;
      })
      .attr('startOffset', (d) => d.startAngle * 210)
      .text(function (d) {
        return vis.interCodeMap[d.index + 1];
      });

    chordNodes
      .on('mouseover', function (event, d) {
        const eventsOfActor = vis.data.filter(
          (data) => data.INTER1 == d.index + 1 || data.INTER2 == d.index + 1
        );
        eventsOfActor.sort((a, b) => a.YEAR - b.YEAR);

        let fatalitiesPerYear = d3.rollups(
          eventsOfActor,
          (a) => d3.sum(a, (b) => b.FATALITIES),
          (b) => b.YEAR
        );

        fatalitiesPerYear = fatalitiesPerYear.map(([year, fatalities]) => ({
          year,
          fatalities,
        }));

        vis.barChartTooltip.show(d, this);
        const containerWidth = 300;
        const containerHeight = 250;
        const margin = { top: 20, right: 30, bottom: 20, left: 50 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;
        const tooltipSVG = d3
          .select('#bar-chart-div')
          .append('svg')
          .attr('width', containerWidth)
          .attr('height', containerHeight);

        const tooltipSVGChart = tooltipSVG
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        tooltipSVG
          .append('text')
          .attr('class', 'axis-title')
          .attr('x', 4)
          .attr('y', 4)
          .attr('dy', '.71em')
          .text('Fatalities (sum)');

        tooltipSVGChart
          .append('text')
          .attr('class', 'axis-title')
          .attr('y', height - 10)
          .attr('x', width + 30)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Year');

        const minYear = fatalitiesPerYear[0].year;
        const maxYear = fatalitiesPerYear[fatalitiesPerYear.length - 1].year;
        const maxFatalities = d3.max(fatalitiesPerYear, (d) => d.fatalities);

        const numYears = maxYear - minYear + 1;

        const yAxisScale = d3
          .scaleLinear()
          .domain([0, maxFatalities])
          .range([height, 0]);
        const xAxisScale = d3
          .scaleBand()
          .domain(fatalitiesPerYear.map((d) => d.year))
          .range([0, width])
          .padding(0.1);
        const yAxis = d3
          .axisLeft(yAxisScale)
          .tickFormat((t) => t)
          .tickSizeOuter(0)
          .tickPadding(5);

        const xAxis = d3
          .axisBottom(xAxisScale)
          .ticks(numYears)
          .tickSizeOuter(0)
          .tickPadding(3);

        const xAxisGroup = tooltipSVGChart
          .append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0, ${height})`)
          .call(xAxis);

        const yAxisGroup = tooltipSVGChart
          .append('g')
          .attr('class', 'axis y-axis')
          .call(yAxis);

        const bars = tooltipSVGChart
          .selectAll('.bar')
          .data(fatalitiesPerYear)
          .join('rect')
          .attr('class', 'bar')
          .attr('x', (d) => xAxisScale(d.year))
          .attr('width', xAxisScale.bandwidth())
          .attr('height', (d) => height - yAxisScale(d.fatalities))
          .attr('y', (d) => yAxisScale(d.fatalities))
          .attr('fill', '#d1d7de');
      })
      .on('mouseleave', function () {
        vis.barChartTooltip.hide();
      })
      .on('click', function (event, d) {
        const isSelected = vis.selectedActor !== 0;
        console.log('is selected: ', isSelected);
        if (isSelected) {
          vis.selectedActor = 0;
          vis.updateVis();
        } else {
          vis.selectedActor = d.index + 1;
          vis.updateVis();
        }
      });

    console.log('arcs: ', chordData);
    console.log('selected: ', vis.selectedActor);

    const filteredChordData =
      vis.selectedActor === 0
        ? chordData
        : chordData.filter((d) => d.source.index + 1 === vis.selectedActor);
    console.log('filtered arcs: ', filteredChordData);

    const chordArcs = vis.chart
      // .append('g')
      // .join('g')
      .selectAll('.chord-arc')
      // .data(chordData)
      .data(filteredChordData, (d) => d.source.index)
      .join('path')
      .attr('class', 'chord-arc')
      .attr('d', d3.ribbon().radius(200))
      .attr('fill', (d) => vis.chordColors[d.source.index])
      .attr('stroke', 'black')
      .classed('selected', (d) => d.source.index + 1 === vis.selectedActor);

    // chordArcs
    //   .on('mouseover', function (event, d) {
    //     d3
    //       .select('#chord-tooltip')
    //       .style('display', 'block')
    //       .style('left', event.pageX + vis.config.tooltipPadding + 'px')
    //       .style('top', event.pageY + vis.config.tooltipPadding + 'px').html(`
    //         <div><i>${
    //           vis.interCodeMap[d.source.index]
    //         } - ${vis.interCodeMap[d.target.index]}</i></div>
    //       `);
    //   })
    //   .on('mouseleave', function () {
    //     d3.select('#chord-tooltip').style('display', 'none');
    //   });
  }
}
