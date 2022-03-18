
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

const symbolMap = new SymbolMap();
const chord = new ChordDiagram();
const bubble = new BubbleDiagram();

 })
 .catch(error => console.error(error));