function styleSetup(){

  // $(function () {
  //    $( '#contextCollapse' ).collapse()
  // });

  $("#argoBrand")
  .effect("shake", {
    direction: "up",
    distance: 5,
    times: 3

  }, 1000)
  .animate({
    color: "#CECECE"
  },
  1000
)};

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function addTiles(map){

  L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
    attribution: 'Powered by <a href="http://www.argolabs.org/">ARGO</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</a>'
  }).addTo(map);
}

function dateRange(data){
  state.minDate = (data.rows[0]['min']);
  state.maxDate = (data.rows[0]['max']);
  state.duration = Math.round((new Date(state.maxDate) - new Date(state.minDate))/(1000*60*60*24));
  // console.log(state)
}

function slider_setup() {
  $( "#time_slider" ).slider();
};

function drawLegends(){
  var legend = new cdb.geo.ui.Legend({
    type: "custom",
    data: [
      { name: "Storage", value: "#2167AB" },
      { name: "Reservoir Capacity", value:"#FFCC00"},
      { name: "Snowpack Capacity", value:"white"}
    ]
  });
  var bubble = new cdb.geo.ui.Legend({
    type: "bubble",
    show_title: true,
    title: "Water Volume in Acre-Feet",
    data: [
      { value: "25,000" }, //"26,315" },
      { value: "5,000,000" }, //"4,973,535" },
      { name: "graph_color", value: "#333" }
    ]
  });
  var stackedLegend = new cdb.geo.ui.StackedLegend({
    legends: [legend, bubble]
  });
  $('#map').append(stackedLegend.render().el);
}

function drawCapacity(map, selectedDate = state.maxDate){
  map.eachLayer(function(layer) {
    //console.log(layer)
    // Remove previous capacity layer
    if ((layer.layers) && (layer.layers.length ==1)){
      //console.log('removed')
      map.removeLayer(layer);
    }
  })


  //searchSetup

  function searchSetup() {
    //reference: http://bl.ocks.org/javisantana/7932459
    var sql = cartodb.SQL({ user: 'california-data-collaborative' });
    $( "#supplyName" )
    .autocomplete({
      source: function( request, response ) {
        var s
        sql.execute(
          `
          SELECT DISTINCT supply_name
          FROM supply_reading_extract
          WHERE supply_name ilike '%${request.term}%'`
        ).done(function(data) {
          response(data.rows.map(function(r) {
            return {
              label: r['supply_name'],
              value: r['supply_name']
            }
          })
        )
      })
    },
    minLength: 2,
    select: function( event, ui ) {
      state.selectedSupply = ui.item.value;
      query = `
      SELECT
      cartodb_id,
      st_y(the_geom) lat,
      st_x(the_geom) lon
      FROM supply_reading_extract
      WHERE supply_name = '${state.selectedSupply}'
      `

      sql.execute(query).done(function(data){

        showFeature(data.rows[0].cartodb_id)

        latLng = new L.LatLng(data.rows[0].lat, data.rows[0].lon);
        map.panTo(latLng);
        $.getJSON('https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20supply_reading_extract%20WHERE%20supply_name%20=%20%27'+state.selectedSupply+'%27;', function(d){ drawResLineGraph(d, "#ts_chart")})
      })
    }
  });
};

searchSetup()

//

// showFeature
var sql = new cartodb.SQL( {
  user: 'california-data-collaborative',
  format: 'geojson' });
  var polygon;

  function showFeature(cartodb_id) {

    sql.execute(`select ST_Centroid(the_geom) as the_geom from supply_reading_extract where cartodb_id = {{cartodb_id}}`, {cartodb_id: cartodb_id} )
    .done(function(geojson) {
      if (polygon) {

        map.removeLayer(polygon);

      }
      polygon = L.geoJson(geojson, {
        style: {}
      }).addTo(map);
    });
  }

  //end showFeature


  var reservoir_capacity = {
    user_name: 'california-data-collaborative',
    type: 'cartodb',
    sublayers: [{
      // Nested query to only return last record for each reservoir to show current levels in tooltip and speed up query.
      // Converting numeric fields to characters to use formatting in tooltip
      sql: "SELECT\
      the_geom,\
      the_geom_webmercator,\
      cartodb_id,\
      TO_CHAR(percent_full*100, '90D00') as percent_full,\
      supply_name,\
      TO_CHAR(supply_storage, '9G999G990') as supply_storage,\
      storage_capacity,\
      SQRT(storage_capacity) sqrt_storage_capacity,\
      TO_CHAR(storage_capacity, '9G999G990') as storage_capacity_text,\
      \
      supply_reading_date\
      FROM supply_reading_extract\
      WHERE (supply_name, supply_reading_date) in (\
        SELECT\
        supply_name,\
        MAX(supply_reading_date)\
        FROM supply_reading_extract\
        WHERE supply_reading_date <= '"+selectedDate+"'\
        GROUP BY supply_name)\
        ORDER BY storage_capacity DESC",
        cartocss: capacityStyles,
        interactivity: ['percent_full', 'supply_name', 'supply_storage', 'storage_capacity', 'storage_capacity_text', 'supply_name', 'supply_reading_date', 'cartodb_id']
      }]
    };
    // Add capacity data layers to map

    cartodb.createLayer(map, reservoir_capacity, options = {https:true})
    .addTo(map, 0)
    .done(function(layer) {
      for (var i = 0; i < layer.getSubLayerCount(); i++) {
        sublayers[i] = layer.getSubLayer(i);
      };

      sublayers[0].setInteraction(true)
      layer.leafletMap.viz.addOverlay({
        type: 'tooltip',
        layer: sublayers[0],
        template: '<div class="cartodb-tooltip-content-wrapper dark"> \
        <div class="cartodb-tooltip-content"> \
        <!--<h4>Date</h4> <p>'+selectedDate.slice(0,10)+'</p>--> \
        <h4>Source Name</h4> <p>{{supply_name}}</p> \
        <!--<h4>Storage (AF)</h4> <p>{{supply_storage}}</p> \
        <h4>Capacity (AF)</h4> <p>{{storage_capacity_text}}</p> \
        <h4>Percent of Capacity</h4> <p>{{percent_full}}%</p></div> </div>-->',
        position: 'bottom|right',
        fields: [{ name: 'name' } ]
      });

      sublayers[0].on('featureOver', function(e, latlng, pos, data) {
        $('#map').css('cursor', 'pointer');
      });

      sublayers[0].on('featureOut', function(e, latlng, pos, data) {
        $('#map').css('cursor', '-webkit-grab');
      });

      sublayers[0].on('featureClick', function(e, latlng, pos, data) {
        showFeature(data.cartodb_id)
        state.selectedSupply = data.supply_name
        $('#supplyName').val(data.supply_name)
        draw_time_series(target='#ts_chart', initialize=true)
        // Get data for dam and draw line graph
        // $.getJSON('https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20supply_reading_extract%20WHERE%20supply_name%20=%20%27'+state.selectedSupply+'%27;', function(d){ drawResLineGraph(d, "#ts_chart")})

      }); // end featureClick

    }); // end .done method of capacity circles
  }

  function drawResLineGraph(tableData, target){

    tsData = MG.convert.date(tableData.rows, 'supply_reading_date', '%Y-%m-%dT%XZ');

    // Reduce the data in the time series graph by a factor of 1/10 to draw faster
    var tsDataFiltered = tsData.filter(function(element, index, array) {
      return (index % 10 === 0 && element.supply_storage > 0);
    });

    var marker = [{"supply_reading_date": new Date(state.selectedDate), "label": state.selectedDate}]

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
    drawBar(data)

    // Draw line graph of levels in selected dam
    MG.data_graphic({
      data: tsDataFiltered,
      full_width: true,
      // title: tsDataFiltered[0].supply_name,

      y_label: 'Water Volume (AF)',
      // height: 195,

      baselines: [{value: tsDataFiltered[0].storage_capacity, label: "Capacity: " + tsDataFiltered[0].storage_capacity.toLocaleString('en', {maximumSignificantDigits : 3}) + " AF"}],
      max_y: tsDataFiltered[0].storage_capacity,
      target: target, // the html element that the graphic is inserted in
      x_accessor: 'supply_reading_date',  // the key that accesses the x value
      y_accessor: ['supply_storage','historical_supply_storage'], // the key that accesses the y value
      legend: ['Recorded','Average'],
      legend_target: '#ts_legend',
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
    //});
  }

  function drawAnimation(map, selectedDate = state.maxDate){
    // Set styles for animation of reservoir levels over time. Includes torque definitions and sizing info
    var CARTOCSS = [
      'Map {',
      '-torque-time-attribute: "supply_reading_date";',
      // Torque allows maximum of 256 values -> scaled from 0 to 255
      '-torque-aggregation-function: "max(supply_storage * 255 / 30751517.0196) ";',
      '-torque-frame-count: ' + state.duration + ';',
      '-torque-animation-duration: 30;',
      '-torque-resolution: 1',
      '}',
      '#reservoirs {',
      'marker-type: ellipse;',
      'marker-fill-opacity: 0.8;',
      'marker-fill: #2167AB; ',
      'marker-line-width: 0;',
      'marker-width: 1;',
      '}',
      // Halved these values compared to styles.css. Possibly a difference of radius vs diameter?
      '#reservoirs[value <=255] {marker-width: 49.75;}',
      '#reservoirs[value <=253] {marker-width: 49.5;}',
      '#reservoirs[value <=252] {marker-width: 49.25;}',
      '#reservoirs[value <=250] {marker-width: 49;}',
      '#reservoirs[value <=249] {marker-width: 48.75;}',
      '#reservoirs[value <=248] {marker-width: 48.5;}',
      '#reservoirs[value <=246] {marker-width: 48.25;}',
      '#reservoirs[value <=245] {marker-width: 48;}',
      '#reservoirs[value <=244] {marker-width: 47.75;}',
      '#reservoirs[value <=242] {marker-width: 47.5;}',
      '#reservoirs[value <=241] {marker-width: 47.25;}',
      '#reservoirs[value <=240] {marker-width: 47;}',
      '#reservoirs[value <=238] {marker-width: 46.75;}',
      '#reservoirs[value <=237] {marker-width: 46.5;}',
      '#reservoirs[value <=236] {marker-width: 46.25;}',
      '#reservoirs[value <=234] {marker-width: 46;}',
      '#reservoirs[value <=233] {marker-width: 45.75;}',
      '#reservoirs[value <=232] {marker-width: 45.5;}',
      '#reservoirs[value <=230] {marker-width: 45.25;}',
      '#reservoirs[value <=229] {marker-width: 45;}',
      '#reservoirs[value <=228] {marker-width: 44.75;}',
      '#reservoirs[value <=226] {marker-width: 44.5;}',
      '#reservoirs[value <=225] {marker-width: 44.25;}',
      '#reservoirs[value <=223] {marker-width: 44;}',
      '#reservoirs[value <=222] {marker-width: 43.75;}',
      '#reservoirs[value <=221] {marker-width: 43.5;}',
      '#reservoirs[value <=219] {marker-width: 43.25;}',
      '#reservoirs[value <=218] {marker-width: 43;}',
      '#reservoirs[value <=217] {marker-width: 42.75;}',
      '#reservoirs[value <=215] {marker-width: 42.5;}',
      '#reservoirs[value <=214] {marker-width: 42.25;}',
      '#reservoirs[value <=213] {marker-width: 42;}',
      '#reservoirs[value <=211] {marker-width: 41.75;}',
      '#reservoirs[value <=210] {marker-width: 41.5;}',
      '#reservoirs[value <=209] {marker-width: 41.25;}',
      '#reservoirs[value <=207] {marker-width: 41;}',
      '#reservoirs[value <=206] {marker-width: 40.75;}',
      '#reservoirs[value <=205] {marker-width: 40.5;}',
      '#reservoirs[value <=203] {marker-width: 40.25;}',
      '#reservoirs[value <=202] {marker-width: 40;}',
      '#reservoirs[value <=201] {marker-width: 39.75;}',
      '#reservoirs[value <=199] {marker-width: 39.5;}',
      '#reservoirs[value <=198] {marker-width: 39.25;}',
      '#reservoirs[value <=196] {marker-width: 39;}',
      '#reservoirs[value <=195] {marker-width: 38.75;}',
      '#reservoirs[value <=194] {marker-width: 38.5;}',
      '#reservoirs[value <=192] {marker-width: 38.25;}',
      '#reservoirs[value <=191] {marker-width: 38;}',
      '#reservoirs[value <=190] {marker-width: 37.75;}',
      '#reservoirs[value <=188] {marker-width: 37.5;}',
      '#reservoirs[value <=187] {marker-width: 37.25;}',
      '#reservoirs[value <=186] {marker-width: 37;}',
      '#reservoirs[value <=184] {marker-width: 36.75;}',
      '#reservoirs[value <=183] {marker-width: 36.5;}',
      '#reservoirs[value <=182] {marker-width: 36.25;}',
      '#reservoirs[value <=180] {marker-width: 36;}',
      '#reservoirs[value <=179] {marker-width: 35.75;}',
      '#reservoirs[value <=178] {marker-width: 35.5;}',
      '#reservoirs[value <=176] {marker-width: 35.25;}',
      '#reservoirs[value <=175] {marker-width: 35;}',
      '#reservoirs[value <=174] {marker-width: 34.75;}',
      '#reservoirs[value <=172] {marker-width: 34.5;}',
      '#reservoirs[value <=171] {marker-width: 34.25;}',
      '#reservoirs[value <=170] {marker-width: 34;}',
      '#reservoirs[value <=168] {marker-width: 33.75;}',
      '#reservoirs[value <=167] {marker-width: 33.5;}',
      '#reservoirs[value <=165] {marker-width: 33.25;}',
      '#reservoirs[value <=164] {marker-width: 33;}',
      '#reservoirs[value <=163] {marker-width: 32.75;}',
      '#reservoirs[value <=161] {marker-width: 32.5;}',
      '#reservoirs[value <=160] {marker-width: 32.25;}',
      '#reservoirs[value <=159] {marker-width: 32;}',
      '#reservoirs[value <=157] {marker-width: 31.75;}',
      '#reservoirs[value <=156] {marker-width: 31.5;}',
      '#reservoirs[value <=155] {marker-width: 31.25;}',
      '#reservoirs[value <=153] {marker-width: 31;}',
      '#reservoirs[value <=152] {marker-width: 30.75;}',
      '#reservoirs[value <=151] {marker-width: 30.5;}',
      '#reservoirs[value <=149] {marker-width: 30.25;}',
      '#reservoirs[value <=148] {marker-width: 30;}',
      '#reservoirs[value <=147] {marker-width: 29.75;}',
      '#reservoirs[value <=145] {marker-width: 29.5;}',
      '#reservoirs[value <=144] {marker-width: 29.25;}',
      '#reservoirs[value <=143] {marker-width: 29;}',
      '#reservoirs[value <=141] {marker-width: 28.75;}',
      '#reservoirs[value <=140] {marker-width: 28.5;}',
      '#reservoirs[value <=138] {marker-width: 28.25;}',
      '#reservoirs[value <=137] {marker-width: 28;}',
      '#reservoirs[value <=136] {marker-width: 27.75;}',
      '#reservoirs[value <=134] {marker-width: 27.5;}',
      '#reservoirs[value <=133] {marker-width: 27.25;}',
      '#reservoirs[value <=132] {marker-width: 27;}',
      '#reservoirs[value <=130] {marker-width: 26.75;}',
      '#reservoirs[value <=129] {marker-width: 26.5;}',
      '#reservoirs[value <=128] {marker-width: 26.25;}',
      '#reservoirs[value <=126] {marker-width: 26;}',
      '#reservoirs[value <=125] {marker-width: 25.75;}',
      '#reservoirs[value <=124] {marker-width: 25.5;}',
      '#reservoirs[value <=122] {marker-width: 25.25;}',
      '#reservoirs[value <=121] {marker-width: 25;}',
      '#reservoirs[value <=120] {marker-width: 24.75;}',
      '#reservoirs[value <=118] {marker-width: 24.5;}',
      '#reservoirs[value <=117] {marker-width: 24.25;}',
      '#reservoirs[value <=116] {marker-width: 24;}',
      '#reservoirs[value <=114] {marker-width: 23.75;}',
      '#reservoirs[value <=113] {marker-width: 23.5;}',
      '#reservoirs[value <=111] {marker-width: 23.25;}',
      '#reservoirs[value <=110] {marker-width: 23;}',
      '#reservoirs[value <=109] {marker-width: 22.75;}',
      '#reservoirs[value <=107] {marker-width: 22.5;}',
      '#reservoirs[value <=106] {marker-width: 22.25;}',
      '#reservoirs[value <=105] {marker-width: 22;}',
      '#reservoirs[value <=103] {marker-width: 21.75;}',
      '#reservoirs[value <=102] {marker-width: 21.5;}',
      '#reservoirs[value <=101] {marker-width: 21.25;}',
      '#reservoirs[value <=99] {marker-width: 21;}',
      '#reservoirs[value <=98] {marker-width: 20.75;}',
      '#reservoirs[value <=97] {marker-width: 20.5;}',
      '#reservoirs[value <=95] {marker-width: 20.25;}',
      '#reservoirs[value <=94] {marker-width: 20;}',
      '#reservoirs[value <=93] {marker-width: 19.75;}',
      '#reservoirs[value <=91] {marker-width: 19.5;}',
      '#reservoirs[value <=90] {marker-width: 19.25;}',
      '#reservoirs[value <=89] {marker-width: 19;}',
      '#reservoirs[value <=87] {marker-width: 18.75;}',
      '#reservoirs[value <=86] {marker-width: 18.5;}',
      '#reservoirs[value <=85] {marker-width: 18.25;}',
      '#reservoirs[value <=83] {marker-width: 18;}',
      '#reservoirs[value <=82] {marker-width: 17.75;}',
      '#reservoirs[value <=80] {marker-width: 17.5;}',
      '#reservoirs[value <=79] {marker-width: 17.25;}',
      '#reservoirs[value <=78] {marker-width: 17;}',
      '#reservoirs[value <=76] {marker-width: 16.75;}',
      '#reservoirs[value <=75] {marker-width: 16.5;}',
      '#reservoirs[value <=74] {marker-width: 16.25;}',
      '#reservoirs[value <=72] {marker-width: 16;}',
      '#reservoirs[value <=71] {marker-width: 15.75;}',
      '#reservoirs[value <=70] {marker-width: 15.5;}',
      '#reservoirs[value <=68] {marker-width: 15.25;}',
      '#reservoirs[value <=67] {marker-width: 15;}',
      '#reservoirs[value <=66] {marker-width: 14.75;}',
      '#reservoirs[value <=64] {marker-width: 14.5;}',
      '#reservoirs[value <=63] {marker-width: 14.25;}',
      '#reservoirs[value <=62] {marker-width: 14;}',
      '#reservoirs[value <=60] {marker-width: 13.75;}',
      '#reservoirs[value <=59] {marker-width: 13.5;}',
      '#reservoirs[value <=58] {marker-width: 13.25;}',
      '#reservoirs[value <=56] {marker-width: 13;}',
      '#reservoirs[value <=55] {marker-width: 12.75;}',
      '#reservoirs[value <=53] {marker-width: 12.5;}',
      '#reservoirs[value <=52] {marker-width: 12.25;}',
      '#reservoirs[value <=51] {marker-width: 12;}',
      '#reservoirs[value <=49] {marker-width: 11.75;}',
      '#reservoirs[value <=48] {marker-width: 11.5;}',
      '#reservoirs[value <=47] {marker-width: 11.25;}',
      '#reservoirs[value <=45] {marker-width: 11;}',
      '#reservoirs[value <=44] {marker-width: 10.75;}',
      '#reservoirs[value <=43] {marker-width: 10.5;}',
      '#reservoirs[value <=41] {marker-width: 10.25;}',
      '#reservoirs[value <=40] {marker-width: 10;}',
      '#reservoirs[value <=39] {marker-width: 9.75;}',
      '#reservoirs[value <=37] {marker-width: 9.5;}',
      '#reservoirs[value <=36] {marker-width: 9.25;}',
      '#reservoirs[value <=35] {marker-width: 9;}',
      '#reservoirs[value <=33] {marker-width: 8.75;}',
      '#reservoirs[value <=32] {marker-width: 8.5;}',
      '#reservoirs[value <=31] {marker-width: 8.25;}',
      '#reservoirs[value <=29] {marker-width: 8;}',
      '#reservoirs[value <=28] {marker-width: 7.75;}',
      '#reservoirs[value <=26] {marker-width: 7.5;}',
      '#reservoirs[value <=25] {marker-width: 7.25;}',
      '#reservoirs[value <=24] {marker-width: 7;}',
      '#reservoirs[value <=22] {marker-width: 6.75;}',
      '#reservoirs[value <=21] {marker-width: 6.5;}',
      '#reservoirs[value <=20] {marker-width: 6.25;}',
      '#reservoirs[value <=18] {marker-width: 6;}',
      '#reservoirs[value <=17] {marker-width: 5.75;}',
      '#reservoirs[value <=16] {marker-width: 5.5;}',
      '#reservoirs[value <=14] {marker-width: 5.25;}',
      '#reservoirs[value <=13] {marker-width: 5;}',
      '#reservoirs[value <=12] {marker-width: 4.75;}',
      '#reservoirs[value <=10] {marker-width: 4.5;}',
      '#reservoirs[value <=9] {marker-width: 4.25;}',
      '#reservoirs[value <=8] {marker-width: 4;}',
      '#reservoirs[value <=6] {marker-width: 3.75;}',
      '#reservoirs[value <=5] {marker-width: 3.5;}',
      '#reservoirs[value <=4] {marker-width: 3.25;}',
      '#reservoirs[value <=2] {marker-width: 3;}',
      '#reservoirs[value <=1] {marker-width: 2.75;}',
      '#reservoirs[value <=0] {marker-width: 2.5;}'
    ].join('\n');

    // Create torque layer for animation
    var reservoir_storage_layer = {
      type: 'torque',
      options: {
        user_name: 'california-data-collaborative',
        table_name: 'supply_reading_extract',
        cartocss: CARTOCSS,
        interactivity: ['supply_storage', 'supply_reading_date']
      }
    };

    // calculate start step
    step = Math.round((new Date(selectedDate) - new Date(state.minDate))/(1000*60*60*24))

    // Draw animation layer using torque
    cartodb.createLayer(map, reservoir_storage_layer, options = {https:true, time_slider:true})
    .addTo(map, 1)
    .done(function(layer) {
      layer.pause();
      $('.slider.ui-slider.ui-slider-horizontal.ui-widget.ui-widget-content.ui-corner-all').on('click mousedown mouseup', function(){
        var pauseDate = layer.getTime();
        var newDate = pauseDate.getUTCFullYear()  + "-" + addZero(pauseDate.getUTCMonth()+1) + "-" + addZero(pauseDate.getUTCDate())
        state.selectedDate = newDate
        // draw_systemwide_time_series('cdec_reservoir', '#ground_summary_ts')
        draw_time_series(target='#ground_summary_ts', initialize=false, system='cdec_reservoir')
        draw_time_series(target='#ts_chart', initialize=false)
        // $.getJSON('https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20supply_reading_extract%20WHERE%20supply_name%20=%20%27'+state.selectedSupply+'%27;', function(d){ drawResLineGraph(d, "#ts_chart")})
      })

      var slider = map.viz.timeSlider;
      slider.formatter(function(d) {
        return (d.getUTCMonth()+1) + "/"+ d.getUTCDate() + "/" + d.getUTCFullYear();
      })
      layer.on('change:time', function(changes){
        var pauseDate = layer.getTime();
        var newDate = pauseDate.getUTCFullYear()  + "-" + addZero(pauseDate.getUTCMonth()+1) + "-" + addZero(pauseDate.getUTCDate())
        state.selectedDate = newDate
        // draw_systemwide_time_series('cdec_reservoir', '#ground_summary_ts')
        draw_time_series(target='#ground_summary_ts', initialize=false, system='cdec_reservoir')
        // console.log(changes)
        // if (changes.step < 7) {
        //   initialize = true
        // } else {
        //   initialize = false
        // }
        // console.log(changes.step)
        // draw_time_series(target='#ts_chart', initialize=initialize)
        draw_time_series(target='#ts_chart', initialize=true)


        // $.getJSON('https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20supply_reading_extract%20WHERE%20supply_name%20=%20%27'+state.selectedSupply+'%27', function(d){ drawResLineGraph(d, "#ts_chart")})

      });

      layer.on('load', function(){});
      layer.on('pause',function(){
        var pauseDate = layer.getTime();
        var newDate = pauseDate.getUTCFullYear()  + "-" + addZero(pauseDate.getUTCMonth()+1) + "-" + addZero(pauseDate.getUTCDate())
        state.selectedDate = newDate
        // $.getJSON('https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20supply_reading_extract%20WHERE%20supply_name%20=%20%27'+state.selectedSupply+'%27', function(d){ drawResLineGraph(d, "#ts_chart")})
        // draw_systemwide_time_series('ucla_estimated_swe', '#snowpack_summary_ts')
        // draw_systemwide_time_series('cdec_reservoir', '#ground_summary_ts')
        draw_time_series(target='#ground_summary_ts', initialize=false, system='cdec_reservoir')
        draw_time_series(target='#ts_chart', initialize=true)
        // drawCapacity(map, newDate)

      });
    })}

    function main() {
      styleSetup()
      var map = new L.Map('map', {
        center: [38, -119],
        zoom: 6,
        scrollWheelZoom:false
      });
      addTiles(map);

      // Make sure this runs first to get global variables
      jQuery.ajaxSetup({async:false});
      // Define date range and set global variables
      $.getJSON('https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20min(supply_reading_date),%20max(supply_reading_date)%20FROM%20supply_reading_extract', dateRange)
      jQuery.ajaxSetup({async:true});

      // Get capacity data
      drawCapacity(map, state.minDate);

      // Draw Animation of reservoir levels on map
      drawAnimation(map);
      draw_time_series(target='#ground_summary_ts', initialize=true, system='cdec_reservoir')
      // draw_time_series(target='#ts_chart', initialize=true)
      // draw_systemwide_time_series('cdec_reservoir', '#ground_summary_ts', initialize = true)
      drawLegends();
      drawBar();

    } // end main
