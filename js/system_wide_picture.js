function draw_time_series(target, initialize = false, system = null, transition){
  console.log(transition)

  if (target == '#ts_chart') {
    query = `
    SELECT *
    FROM supply_reading_extract
    WHERE supply_name = '${state.selectedSupply}'
    `
    legend_target = '#ts_legend'
  } else if (target == '#ground_summary_ts') {
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
    legend_target = '#ground_summary_ts_legend'
  } else {
    console.log('Ur target is invalid :(')
  }

  encodedQuery = encodeURIComponent(query)
  if (initialize == true) {
    $.getJSON('https://california-data-collaborative.carto.com/api/v2/sql?q='+encodedQuery, function(d) {
      seriesData[target] = d
      draw(seriesData[target])
      initialize = false
    })
  } else {
    draw(seriesData[target])
  }

  function draw(tableData) {
    if (initialize == true) {
      tsData = MG.convert.date(tableData.rows, 'supply_reading_date', '%Y-%m-%dT%XZ')
    } else {
      tsData = tableData.rows
    }
    // tsData = MG.convert.date(tableData.rows, 'supply_reading_date', '%Y-%m-%dT%XZ')

    var tsDataFiltered = tsData.filter(function(element, index, array) {
      return (index % 10 === 0 && element.supply_storage > 0);
    });

    if (target == '#ts_chart') {
      $('#supplyName').val(tsDataFiltered[0].supply_name)
      storage = tsData.filter(function(element, index, array) {
        return (
          element.supply_reading_date.getUTCFullYear() == new Date(state.selectedDate).getUTCFullYear() &&
          element.supply_reading_date.getUTCMonth() == new Date(state.selectedDate).getUTCMonth() &&
          element.supply_reading_date.getUTCDate() == new Date(state.selectedDate).getUTCDate()
        );
      });
      data = [
        storage[0].supply_storage,
        // storage[0].historical_supply_storage,
        tsDataFiltered[0].storage_capacity
      ]
      drawBar(data)}

      marker = [{"supply_reading_date": new Date(state.selectedDate), "label": state.selectedDate}];

      MG.data_graphic({
        data: tsDataFiltered,
        full_width: true,
        // title: tsData[0].supply_type,
        y_label: 'Water Volume (AF)',
        baselines: [{value: tsDataFiltered[0].storage_capacity, label: "Capacity: " + tsDataFiltered[0].storage_capacity.toLocaleString('en', {maximumSignificantDigits : 3}) + " AF"}],
        max_y: tsData[0].storage_capacity,
        target: target, // the html element that the graphic is inserted in
        x_accessor: 'supply_reading_date',  // the key that accesses the x value
        y_accessor: ['supply_storage','historical_supply_storage'], // the key that accesses the y value
        legend: ['Recorded','Average'],
        legend_target: legend_target,
        aggregate_rollover: true,
        decimals: 0,
        transition_on_update: transition,
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
















  function draw_systemwide_time_series(system, target, initialize = false) {

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

    // $.getJSON('https://california-data-collaborative.carto.com/api/v2/sql?q='+encodedQuery, function(d) {
    //   seriesData = d
    //   draw(seriesData)
    //   initialize = false
    // })

    function draw(tableData) {
      if (initialize == true) {
        tsData = MG.convert.date(tableData.rows, 'supply_reading_date', '%Y-%m-%dT%XZ')
      } else {
        tsData = tableData.rows
      }
      // tsData = MG.convert.date(tableData.rows, 'supply_reading_date', '%Y-%m-%dT%XZ')

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
