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
      margin: { top: 30, right: 30, bottom: 30, left: 30 },
      tooltipPadding: 5,
    };
    this.data = _data;
    // this.data = this.data.slice(0, 10000);
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
      '#41b2ba',
      '#5276f7',
      '#ae94d4',
      '#dbaa09',
      '#48a4f0',
      '#b0b305',
      '#f3b6fa',
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
  }

  updateVis() {
    let vis = this;
    // Prepare data and scales
    // derive the ACTOR_TYPE columns
    // vis.data.map((row, i) => {
    //   if (i == 0) {
    //     console.log(row);
    //     const actorType1 = vis.interCodeMap[row.INTER1];
    //     const actorType2 = vis.interCodeMap[row.INTER2];
    //     const newRow = {
    //       ...row,
    //       ACTOR_TYPE_1: actorType1,
    //       ACTOR_TYPE_2: actorType2,
    //     };
    //     console.log(newRow);
    //     return newRow;
    //   }
    // });

    let matrix = new Array();
    for (let row = 0; row <= 8; row++) {
      matrix[row] = new Array();
      for (let col = 0; col <= 8; col++) {
        const events = vis.data.filter(
          (data) => data.INTER1 == row && data.INTER2 == col
          //  || (data.INTER1 == col && data.INTER2 == row)
        );
        matrix[row][col] = events.length;
      }
    }
    console.log(matrix);
    vis.matrix = matrix;

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;
    const chordData = d3.chord().padAngle(0.05)(vis.matrix);

    const chordNodeGroup = vis.chart
      .append('g')
      .selectAll('.chord-node')
      .data(chordData.groups)
      .join('g')
      .attr('class', 'chord-node');

    const chordNodes = chordNodeGroup
      .append('path')
      .attr('fill', (_, i) => vis.chordColors[i])
      .attr('stroke', 'black')
      .attr('d', d3.arc().innerRadius(200).outerRadius(210));

    // chordNodeGroup.append('title').text((_, i) => vis.interCodeMap[i]);
    // chordNodeGroup
    //   .append('text')
    //   .attr('dy', -3)
    //   .append('textPath')
    //   .attr('xlink:href', textId.href)
    //   .attr('startOffset', (d) => d.startAngle * outerRadius)
    //   .text((_, i) => vis.interCodeMap[i]);

    chordNodes
      .on('mouseover', function (event, d) {
        const eventsOfActor = vis.data.filter(
          (data) => data.INTER1 == d.index || data.INTER2 == d.index
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
        console.log('fatalities per year after: ', fatalitiesPerYear);

        vis.barChartTooltip.show(d, this);
        const containerWidth = 300;
        const containerHeight = 250;
        const margin = { top: 20, right: 20, bottom: 20, left: 50 };
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

        const minYear = fatalitiesPerYear[0].year;
        const maxYear = fatalitiesPerYear[fatalitiesPerYear.length - 1].year;
        const maxFatalities = d3.max(fatalitiesPerYear, (d) => d.fatalities);

        const numYears = maxYear - minYear + 1;
        console.log(minYear, maxYear, maxFatalities);

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
      });

    const chordArcs = vis.chart
      .append('g')
      .selectAll('.chord-arc')
      .data(chordData)
      .join('path')
      .attr('class', 'chord-arc')
      .attr('d', d3.ribbon().radius(200))
      .attr('fill', (d) => vis.chordColors[d.source.index])
      .attr('stroke', 'black');

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
