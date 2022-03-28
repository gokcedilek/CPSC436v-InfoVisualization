/**
 * Load data from CSV file asynchronously and visualize it
 */

const violent_events = [
  'Battles',
  'Explosions/Remote violence',
  'Violence against civilians',
];
const demonstration_events = ['Protests', 'Riots'];
const non_violent_actions = ['Strategic developments'];

const dispatcher = d3.dispatch('filteredInfoSourceEvent', 'filteredActorType');

let chord;
let bubble_vio;
let bubble_dem;
let bubble_non;
// let data;

// d3.csv('data/data_removed_columns.csv')
Promise.all([d3.csv('data/data_inter_fatalities.csv'), d3.json('data/world-110m.json')])
  .then((data) => {
    // Convert columns to numerical values
    data[0].forEach((d) => {
      Object.keys(d).forEach((attr) => {
        if (
          attr == 'YEAR' ||
          attr == 'INTER1' ||
          attr == 'INTER2' ||
          attr == 'INTERACTION' ||
          attr == 'LATITUDE' ||
          attr == 'LONGITUDE' ||
          attr == 'FATALITIES' ||
          attr == 'TIMESTAMP'
        ) {
          d[attr] = +d[attr];
        }
      });
    });
    // Make column value consistent
    data[0].forEach((d) => {
      // Make general event type groups
      if (violent_events.includes(d['EVENT_TYPE'])) {
        d['GENERAL_EVENT_GROUP'] = 'violent_events';
      } else if (demonstration_events.includes(d['EVENT_TYPE'])) {
        d['GENERAL_EVENT_GROUP'] = 'demonstration_events';
      } else if (non_violent_actions.includes(d['EVENT_TYPE'])) {
        d['GENERAL_EVENT_GROUP'] = 'non_violent_actions';
      } else {
        d['GENERAL_EVENT_GROUP'] = 'others';
      }

      // Split info source scale if multiple scales are present
      if (d['SOURCE_SCALE'].includes('-')) {
        let source_one = d['SOURCE_SCALE'].split('-')[0];
        let source_two = d['SOURCE_SCALE'].split('-')[1];
        d['SOURCE_SCALE'] = source_one;
        let clone = Object.assign({}, d);
        clone['SOURCE_SCALE'] = source_two;
        data.push(clone);
      }
    });

    const timeSlider = new TimeSlider(
      {
        parentElement: '#time-slider',
      },
      data[0]
    );
    const symbolMap = new SymbolMap(
      {
        parentElement: '#symbol-map',
      },
      data[0],
      data[1]
    );
    chord = new ChordDiagram(
      {
        parentElement: '#chord-diagram',
      },
      data[0],
      dispatcher
    );

    bubble_vio = new BubbleDiagram(
      {
        parentElement: '#bubble-diagram-violent_events',
      },
      dispatcher,
      data[0]
    );
    bubble_dem = new BubbleDiagram(
      {
        parentElement: '#bubble-diagram-demonstration_events',
      },
      dispatcher,
      data[0]
    );
    bubble_non = new BubbleDiagram(
      {
        parentElement: '#bubble-diagram-non_violent_actions',
      },
      dispatcher,
      data[0]
    );

    d3.select('#time-slider').on('input', function () {
        let filtered = data[0];
        console.log(filtered)
        let year = + this.value
        d3.select('#time-value').text(year);
        // console.log(year)
        // console.log(data[0][0]['YEAR'] < year)
        filtered = data[0].filter((d) => {
            return d['YEAR'] <= year
        });
        console.log(filtered)

        symbolMap.data = filtered;
        symbolMap.updateVis();

        chord.data = filtered;
        chord.updateVis();

        bubble_vio.data = filtered.filter(
            (d) => d['GENERAL_EVENT_GROUP'] == 'violent_events'
          );
          bubble_vio.updateVis();
  
          bubble_dem.data = filtered.filter(
            (d) => d['GENERAL_EVENT_GROUP'] == 'demonstration_events'
          );
          bubble_dem.updateVis();
  
          bubble_non.data = filtered.filter(
            (d) => d['GENERAL_EVENT_GROUP'] == 'non_violent_actions'
          );
          bubble_non.updateVis();

    });

    d3.select('#country-selector').on('change', function () {
      let selected = d3.select(this).property('value');
      let filtered = data[0];

      if (selected) {
        if (selected != 'All') {
          filtered = data[0].filter((d) => d['COUNTRY'] == selected);
        }

        symbolMap.data = filtered;
        symbolMap.updateVis();

        chord.data = filtered;
        chord.updateVis();

        bubble_vio.data = filtered.filter(
          (d) => d['GENERAL_EVENT_GROUP'] == 'violent_events'
        );
        bubble_vio.updateVis();

        bubble_dem.data = filtered.filter(
          (d) => d['GENERAL_EVENT_GROUP'] == 'demonstration_events'
        );
        bubble_dem.updateVis();

        bubble_non.data = filtered.filter(
          (d) => d['GENERAL_EVENT_GROUP'] == 'non_violent_actions'
        );
        bubble_non.updateVis();
      }
      // data = data[0];
    });
  })
  .catch((error) => console.error(error));

// dispatcher.on('filterByActor', () => {});

dispatcher.on(
  'filteredInfoSourceEvent',
  (selectedEvents, selectedInfoSource) => {
    console.log('selected events: ', selectedEvents);
    console.log('selectedInfoSource: ', selectedInfoSource);
    // if (selectedEvents === '' && selectedInfoSource.length === '') {
    //   // chord.data = data;

    // } else {
    // chord.data = data.filter(d => selectedInfoSourceEvents.includes(d.GENERAL_EVENT_GROUP));
    // chord.data = data.filter(
    //   (d) =>
    //     d.GENERAL_EVENT_GROUP === selectedEvents &&
    //     d.SOURCE_SCALE === selectedInfoSource
    // );
    chord.eventType = selectedEvents;
    chord.sourceScale = selectedInfoSource;
    // }
    chord.updateVis();
  }
);

dispatcher.on('filteredActorType', (selectedActor) => {
  bubble_dem.selectedActor = selectedActor;
  bubble_vio.selectedActor = selectedActor;
  bubble_non.selectedActor = selectedActor;
  bubble_dem.updateVis();
  bubble_vio.updateVis();
  bubble_non.updateVis();
});
