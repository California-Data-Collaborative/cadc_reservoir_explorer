// application state object
var state = {
  minDate : "",
  maxDate : "",
  duration : "",
  capacityLayer : "",
  selectedDate : "",
  selectedSupply : ""
}

state.selectedSupply = 'whole-sierra'


var seriesData = {
  '#ts_chart' : {},
  '#ground_summary_ts' : {}
}

// cartography globals
var sublayers = [];
// var sublayers_design = [];
// var capacityLayer;

// style variables
var capacityStyles = `
#supply_reading_extract{
  marker-fill-opacity: 0.75;
  marker-line-color: #FFF;
  marker-line-opacity: 0;
  marker-placement: point;
  marker-multi-policy: largest;
  marker-type: ellipse;

  marker-allow-overlap: true;
  marker-clip: false;
  marker-width: ramp([sqrt_storage_capacity], 5, 98, 256, equal);
  marker-fill: #FFCC00;
  [supply_name = 'whole-sierra'] {
    marker-fill: white;
    marker-fill-opacity: .5;
  }
}
`
