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
      containerHeight: 800,
      margin: { top: 30, right: 30, bottom: 30, left: 30 },
      tooltipPadding: 5,
      legendWidth: 170,
      legendHeight: 8,
      legend: {
        marginLeft: 5,
        marginBetween: 20,
        marginTop: 10,
        textPadding: 20,
      },
    };
    this.data = _data;
    this.selectedActor = 0;
    this.dispatcher = _dispatcher;
    this.interCodeMap = {
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

    vis.legend = vis.svg.append('g').attr('transform', `translate(50, 480)`);
    vis.legendData = Object.values(vis.interCodeMap);

    vis.updateVis();
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

    // const textId = { id: 0, href: new URL('#0', window.location) };
    // vis.chart
    //   .append('path')
    //   .attr('id', textId.id)
    //   .attr('fill', 'none')
    //   .attr(
    //     'd',
    //     d3.arc()({ outerRadius: 210, startAngle: 0, endAngle: 2 * Math.PI })
    //   );

    const legendGroups = vis.legend
      .selectAll('legend-item')
      .data(vis.legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item');

    legendGroups
      .append('rect')
      .attr('class', 'legend-icon')
      .attr('fill', (_, i) => vis.chordColors[i])
      .attr('width', 10)
      .attr('height', 10)
      // .attr('y', 0)
      // .attr('x', (d, i) => i * 150);
      .attr('x', (d, i) => {
        if (i % 2 == 0) {
          return vis.config.legend.marginLeft;
        } else {
          return vis.config.legendWidth;
        }
      })
      .attr('y', (d, i) => {
        return (
          Math.floor(i / 2) * vis.config.legend.marginBetween +
          vis.config.legend.marginTop
        );
      });

    legendGroups
      .append('text')
      .attr('class', 'legend-label')
      // .attr('x', (d, i) => i * 150 + 10)
      // .attr('y', (d, i) => 10)
      .attr('x', (d, i) => {
        if (i % 2 == 0) {
          return vis.config.legend.marginLeft + vis.config.legend.textPadding;
        } else {
          return vis.config.legendWidth + vis.config.legend.textPadding;
        }
      })
      .attr('y', (d, i) => {
        return (
          Math.floor(i / 2) * vis.config.legend.marginBetween +
          vis.config.legend.marginTop * 2
        );
      })
      .text((d) => d);

    const chordNodeGroup = vis.chart
      // .append('g')
      // .join('g')
      .selectAll('.chord-node')
      .data(chordData.groups)
      .join('g')
      .attr('class', 'chord-node');

    const chordNodes = chordNodeGroup
      .append('path')
      .attr('fill', (_, i) => vis.chordColors[i])
      .attr('stroke', 'black')
      .attr('d', d3.arc().innerRadius(200).outerRadius(210))
      .attr('id', (_, i) => 'chord-node-id' + i);

    // chordNodeGroup
    //   .append('text')
    //   // .attr('dx', 3)
    //   .attr('dy', (d, i) => {
    //     if (d.value < 700) {
    //       if (i % 2 == 0) {
    //         return -20;
    //       } else {
    //         return -5;
    //       }
    //     } else {
    //       return -5;
    //     }
    //   })
    //   .attr('font-size', '0.65em')
    //   .append('textPath')
    //   // .attr('textLength', 40)
    //   .attr('xlink:href', function (d) {
    //     // return '#chord-node-id' + d.index;
    //     return textId.href;
    //   })
    //   .attr('startOffset', (d) => d.startAngle * 210)
    //   .text(function (d) {
    //     return vis.interCodeMap[d.index + 1];
    //   });

    chordNodes.on('click', function (event, d) {
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

    chordArcs
      .on('mouseover', function (event, d) {
        const eventsOfActor = vis.data.filter(
          (data) =>
            data.INTER1 == d.source.index + 1 &&
            data.INTER2 == d.target.index + 1
        );
        eventsOfActor.sort((a, b) => a.YEAR - b.YEAR);
        console.log('d: ', d);
        const sourceActor = vis.interCodeMap[d.source.index + 1];
        const targetActor = vis.interCodeMap[d.target.index + 1];
        console.log('source: ', sourceActor, ' target: ', targetActor);

        d3.select('#chord-tooltip').style('display', 'block');

        const barChart = new BarChart(
          {
            parentElement: '#chord-tooltip',
          },
          eventsOfActor,
          sourceActor,
          targetActor
        );
      })
      .on('mouseleave', function () {
        // vis.barChartTooltip.hide();
        d3.select('#chord-tooltip').style('display', 'none');
        d3.select('#chord-tooltip-svg').remove();
      });
  }
}
