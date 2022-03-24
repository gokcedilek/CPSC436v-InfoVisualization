
/**
* Load data from CSV file asynchronously and visualize it
*/
Promise.all([
    d3.csv('data/data_inter.csv'),
    d3.json('data/world-110m.json')
  ]).then(data => {
    // Convert columns to numerical values
    data[0].forEach(d => {
        Object.keys(d).forEach(attr => {
            if (attr == 'YEAR' || attr == 'INTER1' || attr == 'INTER2' || attr == 'INTERACTION' || 
            attr == 'LATITUDE' || attr == 'LONGITUDE' || attr == 'FATALITIES' || attr == 'TIMESTAMP'){
                d[attr] = +d[attr]; 
            }
    })
  });

const timeSlider = new TimeSlider({
    parentElement: '#time-slider'
}, data[0]);
const symbolMap = new SymbolMap({
    parentElement: '#symbol-map'
}, data[0], data[1]);
const chord = new ChordDiagram({
    parentElement: '#chord-diagram'
}, data[0]);
const bubble = new BubbleDiagram({
    parentElement: '#bubble-diagram'
}, data[0]);

d3.select('#country-selector').on('change', function() {
    let selected = d3.select(this).property('value');
    let filtered = data[0];

    if (selected) {
        if (selected != "All"){
            filtered = data[0].filter((d) => d['COUNTRY'] == selected);
        }
      
        symbolMap.data = filtered;
        symbolMap.updateVis();

        chord.data = filtered;
        chord.updateVis();
        
        bubble.data = filtered;
        bubble.updateVis();
    
    }
  });

 })
 .catch(error => console.error(error));