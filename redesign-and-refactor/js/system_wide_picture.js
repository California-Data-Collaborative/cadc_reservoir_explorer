var seriesData = {}
function draw_systemwide_time_series(system, target, initialize = false) {

  // query = `
  //   SELECT
  //     supply_reading_date,
  //     SUM(supply_storage) supply_storage,
  //     SUM(storage_capacity) storage_capacity,
  //     SUM(historical_supply_storage) historical_supply_storage
  //     FROM (
  //       SELECT
  //         *,
  //         ROW_NUMBER() OVER(ORDER BY cartodb_id ASC) AS row
  //       FROM supply_reading_extract
  //     ) t
  //     WHERE t.row % 2 = 0
  //     AND supply_type = '${system}'
  //     GROUP BY supply_reading_date
  //     `

  query = `
  SELECT
    supply_reading_date,
    MIN(supply_type) supply_type,
    SUM(supply_storage) supply_storage,
    SUM(storage_capacity) storage_capacity,
    SUM(historical_supply_storage) historical_supply_storage
  FROM supply_reading_extract
  WHERE supply_type = '${system}'
  GROUP BY supply_reading_date
  `
  encodedQuery = encodeURIComponent(query)

  if (initialize == true) {
    $.getJSON('https://california-data-collaborative.carto.com/api/v2/sql?q='+encodedQuery, function(d) {
      seriesData = d
      // console.log(seriesData)
      draw(seriesData)
      initialize = false
    })
  } else {
    // console.log(seriesData)
    draw(seriesData)
  }





  function draw(tableData) {
      if (initialize == true) {
          tsData = MG.convert.date(tableData.rows, 'supply_reading_date', '%Y-%m-%dT%XZ')
      } else {
        tsData = tableData.rows
      }


      var tsDataFiltered = tsData.filter(function(element, index, array) {
        return (index % 10 === 0 && element.supply_storage > 0);
      });

      // var tsDataFiltered = tsData.filter(function(element, index, array) {
      //   return (index % 3 === 0 && element.supply_storage > 0);
      // });

    marker = [{"supply_reading_date": new Date(state.selectedDate), "label": state.selectedDate}];

    MG.data_graphic({
      data: tsDataFiltered,
      full_width: true,
      // title: tsData[0].supply_type,

      y_label: 'Water Volume (AF)',
      // height: 195,

      baselines: [{value: tsDataFiltered[0].storage_capacity, label: "Capacity: " + tsDataFiltered[0].storage_capacity.toLocaleString('en', {maximumSignificantDigits : 3}) + " AF"}],
      max_y: tsData[0].storage_capacity,
      target: target, // the html element that the graphic is inserted in
      x_accessor: 'supply_reading_date',  // the key that accesses the x value
      y_accessor: ['supply_storage','historical_supply_storage'], // the key that accesses the y value
      legend: ['Recorded','Average'],
      legend_target: '#ground_summary_ts_legend',
      aggregate_rollover: true,
      decimals: 0,
      x_extended_ticks: true,
      y_extended_ticks: true,
      markers: marker,
      linked: true
      //   mouseover: function(d, i) {
      //     console.log(d);
      //         d3.select('#ts_chart svg .mg-active-datapoint')
      //             .text(d)
      //
      // }
    });

    d3.selectAll('.label')
    .attr('transform', 'translate(-14, 0) rotate(-90)');

    d3.selectAll('.mg-marker-text')
    .attr('transform', 'translate(0, 160)');

  }

}
