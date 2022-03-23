
/**
* Load data from CSV file asynchronously and visualize it
*/

const violent_events = ['Battles', 'Explosions/Remote violence', 'Violence against civilians']
const demonstration_events = ['Protests', 'Riots']
const non_violent_actions = ['Strategic developments']
// d3.csv('data/data_removed_columns.csv')
// d3.csv('data/data_bubble.csv')
d3.csv('data/data_removed_columns_sm.csv')
.then(data => {
    // Convert columns to numerical values
    data.forEach(d => {
        Object.keys(d).forEach(attr => {
            if (attr == 'YEAR' || attr == 'INTER1' || attr == 'INTER2' || attr == 'INTERACTION' || 
            attr == 'LATITUDE' || attr == 'LONGITUDE' || attr == 'FATALITIES' || attr == 'TIMESTAMP'){
                d[attr] = +d[attr]; 
            }
    });
    // Make column value consistent
    data.forEach(d => {
        // Make general event type groups
        if (violent_events.includes(d['EVENT_TYPE'])) {
            d['GENERAL_EVENT_GROUP'] = 'violent_events'
        } else if (demonstration_events.includes(d['EVENT_TYPE'])) {
            d['GENERAL_EVENT_GROUP'] = 'demonstration_events'
        } else if (non_violent_actions.includes(d['EVENT_TYPE'])) {
            d['GENERAL_EVENT_GROUP'] = 'non_violent_actions'
        } else {
            d['GENERAL_EVENT_GROUP'] = 'others'
        }

        // Split info source scale if multiple scales are present
        if (d['SOURCE_SCALE'].includes('-')) {
            let source_one = d['SOURCE_SCALE'].split('-')[0];
            let source_two = d['SOURCE_SCALE'].split('-')[1];
            d['SOURCE_SCALE'] = source_one
            let clone = Object.assign({}, d);
            clone['SOURCE_SCALE'] = source_two
            data.push(clone);
        }
    });
  });
const symbolMap = new SymbolMap({
    parentElement: '#symbol-map'
}, data);
const chord = new ChordDiagram({
    parentElement: '#chord-diagram'
}, data);

const bubble_vio = new BubbleDiagram({
    parentElement: '#bubble-diagram-violent_events'
}, data)
const bubble_dem = new BubbleDiagram({
    parentElement: '#bubble-diagram-demonstration_events'
}, data);
const bubble_non = new BubbleDiagram({
    parentElement: '#bubble-diagram-non_violent_actions'
}, data);

d3.select('#country-selector').on('change', function() {
    let selected = d3.select(this).property('value');
    let filtered = data

    if (selected) {
        if (selected != "All"){
            filtered = data.filter((d) => d['COUNTRY'] == selected);
        }
      
        symbolMap.data = filtered;
        symbolMap.updateVis();

        chord.data = filtered;
        chord.updateVis();

        bubble_vio.data = filtered.filter((d) => d['GENERAL_EVENT_GROUP'] == 'violent_events');
        bubble_vio.updateVis();

        bubble_dem.data = filtered.filter((d) => d['GENERAL_EVENT_GROUP'] == 'demonstration_events');
        bubble_dem.updateVis();

        bubble_non.data = filtered.filter((d) => d['GENERAL_EVENT_GROUP'] == 'non_violent_actions');
        bubble_non.updateVis();
    
    }
  });

 })
 .catch(error => console.error(error));