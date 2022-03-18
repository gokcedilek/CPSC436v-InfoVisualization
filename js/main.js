
/**
* Load data from CSV file asynchronously and visualize it
*/
d3.csv('data/data_removed_columns.csv')
.then(data => {
    // Convert columns to numerical values
    data.forEach(d => {
        Object.keys(d).forEach(attr => {
            if (attr == 'YEAR' || attr == 'INTER1' || attr == 'INTER2' || attr == 'INTERACTION' || 
            attr == 'LATITUDE' || attr == 'LONGITUDE' || attr == 'FATALITIES' || attr == 'TIMESTAMP'){
                d[attr] = +d[attr]; 
            }
    });
  });

const symbolMap = new SymbolMap({
    parentElement: '#symbol-map'
}, data);
const chord = new ChordDiagram({
    parentElement: '#chord-diagram'
}, data);
const bubble = new BubbleDiagram({
    parentElement: '#bubble-diagram'
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
        
        bubble.data = filtered;
        bubble.updateVis();
    
    }
  });

 })
 .catch(error => console.error(error));