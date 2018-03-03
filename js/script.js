function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function main() {

  var map = new L.Map('map', {
    center: [38, -119],
    zoom: 6,
  });

  // For storing the sublayers
  var sublayers = [];
  var sublayers_design = []

  // Pull tiles from OpenStreetMap
  L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }).addTo(map);

  //Get today's date in format for SQl query
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  //var endDate = yyyy + '-' + addZero(mm) + '-' + addZero(dd) + ' 00:00';
  // Set 5 year window for data
  var years = 5;
  var startYear = yyyy - years;
  //var startDate = startYear + '-' + addZero(mm) + '-' + addZero(dd) + ' 00:00';
  var endDate = '2016-06-07 00:00';
  var startDate = '2015-05-06 00:00';
  // Calculate number of days
  var duration = Math.round((new Date(endDate)- new Date(startDate))/(1000*60*60*24));
  console.log(duration);

  // Get capacity data
  var reservoir_capacity = {
    user_name: 'california-data-collaborative',
    type: 'cartodb',
    sublayers: [{
      sql: "SELECT * FROM reservoir_levels_1 WHERE (date = ('" + endDate + "'))",
      //sql: "SELECT * FROM reservoir_levels_1 WHERE (date = ('2016-06-07'))",
      cartocss: capacityStyles,
      interactivity: ['precent_full', 'name', 'reservoir_storage', 'storage_capacity', 'dam_id', 'date']
    }]
  };

  // Add capacity data layers to map
  cartodb.createLayer(map, reservoir_capacity, options = {https:true})
    .addTo(map, 0)
    .done(function(layer) {
      var legend = new cdb.geo.ui.Legend({
        type: "custom",
        data: [
        { name: "Reservoir Storage", value: "#2167AB" },
        { name: "Reservoir Capacity", value:"#FFCC00"}
        ]
      });
      var bubble = new cdb.geo.ui.Legend({
        type: "bubble",
        show_title: true,
        title: "Water Volume in Acre-Feet",
        data: [
        { value: "26,315" },
        { value: "4,973,535" },
        { name: "graph_color", value: "#333" }
        ]
      });
      var stackedLegend = new cdb.geo.ui.StackedLegend({
        legends: [legend, bubble]
      });
      $('#map').append(stackedLegend.render().el);

      for (var i = 0; i < layer.getSubLayerCount(); i++) {
          sublayers[i] = layer.getSubLayer(i);
      };
      //sublayers[0].hide()

      sublayers[0].setInteraction(true)
      layer.leafletMap.viz.addOverlay({
          type: 'tooltip',
          layer: sublayers[0],
          template: '<div class="cartodb-tooltip-content-wrapper dark"> <div class="cartodb-tooltip-content"> <h4>Reservoir Name</h4> <p>{{name}} <h4>Total Capacity (AF)</h4> <p>{{storage_capacity}}</p> </div> </div>',
          //template: '<div class="cartodb-tooltip-content-wrapper dark"> <div class="cartodb-tooltip-content"> <h4>Reservoir Name</h4> <p>{{name}}</p> <h4>Percent of Capacity</h4> <p>{{precent_full}}</p> <h4>Storage (AF)</h4> <p>{{reservoir_storage}}</p> <h4>Total Capacity (AF)</h4> <p>{{storage_capacity}}</p> </div> </div>',
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
        console.log(data.dam_id)

      //dev
      // gets data for selected dam over time
        $.getJSON("https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20reservoir_levels_1%20WHERE%20dam_id%20=%20%27"+data.dam_id+"%27%20AND%20date%20<=%27"+endDate+"%27%20AND%20date%20>=%27"+startDate+"%27", function(tableData) {

          tsData = MG.convert.date(tableData.rows, 'date', '%Y-%m-%dT%XZ');

          MG.data_graphic({
            //animate_on_load: true,
            //description: "test",
            data: tsData,
            full_width: true,
            title: data.name,
            //buffer: 10,
            //yax_units_append: true,
            //yax_units: '(AF)',
            //y_axis: false,
            //small_text: true,
            y_label: 'Water Volume (AF)',
            height: 195,

            //full_height:true,
            min_x: new Date(startDate),//new Date('2015-05-06'),
            max_x: new Date(endDate),//new Date('2016-06-07'),
            baselines: [{value: data.storage_capacity, label: "Reservoir Capacity: " + data.storage_capacity}],
            //xax_count: 7,
            max_y: data.storage_capacity,
            //max_y: 5000000,
            target: "#ts", // the html element that the graphic is inserted in
            x_accessor: 'date',  // the key that accesses the x value
            y_accessor: 'reservoir_storage' // the key that accesses the y value
            //   mouseover: function(d, i) {
            //     var month = d.time.getMonth() + 1;
            //     d3.select(pageLocation+' svg .mg-active-datapoint')
            //     .text('Date: ' + month + '/' + d.time.getDate() + ' Time: ' + d.time.getHours() + ':' + addZero(d.time.getMinutes()) + ' Count: '+ d.total)
            //   },
            //   markers: peak_marker,
          });

          d3.selectAll('.label')
            .attr('transform', 'translate(-14, 0) rotate(-90)');
        });
      // end dev
      });
  });

  // $.getJSON("https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20reservoir_levels_1%20WHERE%20date%20<=%27"+endDate+"%27%20AND%20date%20>=%27"+startDate+"%27", function(tableData) {
  //     tsData = MG.convert.date(tableData.rows, 'date', '%Y-%m-%dT%XZ');
  //     console.log(tsData);
  //
  //     var reservoir_storage = tsData.filter(function(d) {
  //         return d.date == String(new Date(endDate));
  //     });

  var CARTOCSS = [
      'Map {',
      '-torque-time-attribute: "date";',
      '-torque-aggregation-function: "sum(reservoir_storage * 255 / 4973535) ";',//"Math.round((255 * sum(reservoir_storage)) / 4973535) ";',
      '-torque-frame-count: ' + duration + ';',
      '-torque-animation-duration: 15;',
      '-torque-resolution: 1',
      '}',
      '#reservoirs {',
      'marker-type: ellipse;',
      'marker-fill-opacity: 0.8;',
      'marker-fill: #2167AB; ',
      'marker-line-width: 0;',
      'marker-width: 1;',
      '}',
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

  var reservoir_storage_layer = {
    type: 'torque',
    options: {
        user_name: 'california-data-collaborative',
        table_name: 'reservoir_levels_1',
        //query: "SELECT * FROM reservoir_levels_1",// WHERE (date = ('" + sliderDate + "'))",
        //sql: "SELECT * FROM reservoir_levels_1 WHERE (date = ('2016-06-07'))",
        cartocss: CARTOCSS,//storageStyles,
        interactivity: ['reservoir_storage', 'date']
    }
  };
  //var daily_storage = reservoir_storage.filter(function (d){
    //  return d.date == String(new Date(endDate));
  //});

  cartodb.createLayer(map, reservoir_storage_layer, options = {https:true, time_slider:true})
    .addTo(map, 1)
    .done(function(layer) {
        layer.on('change:time', function(changes){
            if (changes.step === layer.provider.getSteps() - 1) {
                    layer.pause();
                    }
        });
        layer.on('load', function(){
            layer.play();
        });
    })
    .error(function(err) {
        console.log("Error: " + err);
    });

}
