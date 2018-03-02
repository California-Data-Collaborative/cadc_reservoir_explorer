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
  L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }).addTo(map);

  var CARTOCSS = [
      'Map {',
      '-torque-time-attribute: "date";',
      '-torque-aggregation-function: "sum(reservoir_storage)";',
      '-torque-frame-count: 1825;',
      '-torque-animation-duration: 15;',
      '-torque-resolution: 1',
      '}',
      '#layer {',
      '  marker-width: "reservoir_storage"/5000;',
      '  marker-type: ellipse;',
      '  marker-fill-opacity: 0.8;',
      '  marker-fill: #2167AB; ',
      //'  comp-op: "lighten";',
      '  marker-line-width: 0;',
      '}'
    ].join('\n');

  //Get today's date in format for SQl query
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  //var endDate = yyyy + '-' + addZero(mm) + '-' + addZero(dd);
  // Set 5 year window for data
  var startYear = yyyy - 5;
  //var startDate = startYear + '-' + addZero(mm) + '-' + addZero(dd);
  var endDate = '2016-06-07 00:00';
  var startDate = '2015-05-06 00:00';

  // Get capacity data
  var reservoir_capacity = {
    user_name: 'california-data-collaborative',
    type: 'cartodb',
    sublayers: [{
      sql: "SELECT * FROM reservoir_levels_1 WHERE (date = ('" + endDate + "'))",
      //sql: "SELECT * FROM reservoir_levels_1 WHERE (date = ('2016-06-07'))",
      cartocss: capacityStyles
    }]
  };

  // Implement Slider here
  // $(#slider).slider({
  //     range: true,
  //     min: new Date(startDate),
  //     max: new Date(endDate),
  //     step: 1,
  //     values: position

  //})

  // var formatDateIntoYear = d3.time.format("%Y");
  // var formatDate = d3.time.format("%b %Y");
  //
  // //var margin = {top:0, right:10, bottom:0, left:10},
  //     //width = 960 -margin.left - margin.right,
  //     //height = 500 - margin.top - margin.bottom;
  //
  // var svg = d3.select("#slider")
  //     .append("svg")
  //     //.attr("width", width + margin.left + margin.right)
  //     //.attr("height", height);
  //
  // var x = d3.time.scale()
  //     .domain([new Date(startDate), new Date(endDate)])
  //     .range([0, svg.width])
  //     .clamp(true);
  //
  // var slider = svg.append("g")
  //     .attr("class", "slider");
  //     //.attr("transform", "translate(" + margin.left + "," + height / 2 + ")");
  //
  // slider.append("line")
  //     .attr("class", "track")
  //     .attr("x1", x.range()[0])
  //     .attr("x2", x.range()[1])
  //   .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  //     .attr("class", "track-inset")
  //   .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  //     .attr("class", "track-overlay")
  //     .call(d3.drag()
  //         .on("start.interrupt", function() { slider.interrupt(); })
  //         .on("start drag", function() { drawStorage(x.invert(d3.event.x)); }));
  //
  // slider.insert("g", ".track-overlay")
  //     .attr("class", "ticks")
  //     .attr("transform", "translate(0," + 18 + ")")
  //   .selectAll("text")
  //     .data(x.ticks(10))
  //     .enter()
  //     .append("text")
  //     .attr("x", x)
  //     .attr("y", 10)
  //     .attr("text-anchor", "middle")
  //     .text(function(d) { return formatDateIntoYear(d); });
  //
  // var label = slider.append("text")
  //     .attr("class", "label")
  //     .attr("text-anchor", "middle")
  //     .text(formatDate(startDate))
  //     .attr("transform", "translate(0," + (-25) + ")")
  //
  // var handle = slider.insert("circle", ".track-overlay")
  //     .attr("class", "handle")
  //     .attr("r", 9);

  //placeholder for slider output
  //sliderDate = '2015-12-07';

  // Add capacity data layers to map
  //var drawStorage = function(d){
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
    });



  // $.getJSON("https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20reservoir_levels_1%20WHERE%20date%20<=%27"+endDate+"%27%20AND%20date%20>=%27"+startDate+"%27", function(tableData) {
  //     tsData = MG.convert.date(tableData.rows, 'date', '%Y-%m-%dT%XZ');
  //     console.log(tsData);
  //
  //     var reservoir_storage = tsData.filter(function(d) {
  //         return d.date == String(new Date(endDate));
  //     });

  // Put layer data into a JS object
  // var reservoir_storage = {
  //   user_name: 'california-data-collaborative',
  //   type: 'torque',
  //   sublayers: [{
  //     sql: "SELECT * FROM reservoir_levels_1",// WHERE (date = ('" + sliderDate + "'))",
  //     //sql: "SELECT * FROM reservoir_levels_1 WHERE (date = ('2016-06-07'))",
  //     cartocss: CARTOCSS//storageStyles,
  //     //interactivity: ['precent_full', 'name', 'reservoir_storage', 'storage_capacity', 'dam_id', 'date']
  //   }]
  // };
  var reservoir_storage = {
    type: 'torque',
    options: {
        user_name: 'california-data-collaborative',
        table_name: 'reservoir_levels_1',
        //query: "SELECT * FROM reservoir_levels_1",// WHERE (date = ('" + sliderDate + "'))",
        //sql: "SELECT * FROM reservoir_levels_1 WHERE (date = ('2016-06-07'))",
        cartocss: CARTOCSS//storageStyles,
        //interactivity: ['precent_full', 'name', 'reservoir_storage', 'storage_capacity', 'dam_id', 'date']
    }
  };
  console.log(reservoir_storage);
  //var daily_storage = reservoir_storage.filter(function (d){
    //  return d.date == String(new Date(endDate));
  //});

  cartodb.createLayer(map, reservoir_storage, options = {https:true, time_slider:true})
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

        // for (var i = 0; i < layer.getSubLayerCount(); i++) {
        //   sublayers[i] = layer.getSubLayer(i);
        // };
        //
        // //sublayers[0].hide()
        //
        // sublayers[0].setInteraction(true)
        // layer.leafletMap.viz.addOverlay({
        //   type: 'tooltip',
        //   layer: sublayers[0],
        //   //template: '<div class="cartodb-tooltip-content-wrapper dark"> <div class="cartodb-tooltip-content"> <h4>Reservoir Name</h4> <p>{{name}}</p> <h4>Percent of Capacity</h4> <p>{({precent_full}*100).toFixed(2) + "%"}</p> <h4>Storage (AF)</h4> <p>{{reservoir_storage}.toLocaleString()}</p> <h4>Total Capacity (AF)</h4> <p>{{storage_capacity}.toLocaleString()}</p> </div> </div>',
        //   template: '<div class="cartodb-tooltip-content-wrapper dark"> <div class="cartodb-tooltip-content"> <h4>Reservoir Name</h4> <p>{{name}}</p> <h4>Percent of Capacity</h4> <p>{{precent_full}}</p> <h4>Storage (AF)</h4> <p>{{reservoir_storage}}</p> <h4>Total Capacity (AF)</h4> <p>{{storage_capacity}}</p> </div> </div>',
        //   position: 'bottom|right',
        //   fields: [{ name: 'name' } ]
        //  });
        //
        // sublayers[0].on('featureOver', function(e, latlng, pos, data) {
        //   $('#map').css('cursor', 'pointer');
        // });
        //
        // sublayers[0].on('featureOut', function(e, latlng, pos, data) {
        //   $('#map').css('cursor', '-webkit-grab');
        // });
        //
        // sublayers[0].on('featureClick', function(e, latlng, pos, data) {
        //   console.log(data.dam_id)
        //
        //   //dev
        //   // gets data for selected dam over time
        //   $.getJSON("https://california-data-collaborative.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20reservoir_levels_1%20WHERE%20dam_id%20=%20%27"+data.dam_id+"%27%20AND%20date%20<=%27"+endDate+"%27%20AND%20date%20>=%27"+startDate+"%27", function(tableData) {
        //
        //       tsData = MG.convert.date(tableData.rows, 'date', '%Y-%m-%dT%XZ');
        //
        //       MG.data_graphic({
        //         //animate_on_load: true,
        //         //description: "test",
        //         data: tsData,
        //         full_width: true,
        //         title: data.name,
        //         //buffer: 10,
        //         //yax_units_append: true,
        //         //yax_units: '(AF)',
        //         //y_axis: false,
        //         //small_text: true,
        //         y_label: 'Water Volume (AF)',
        //         height: 195,
        //
        //         //full_height:true,
        //         min_x: new Date(startDate),//new Date('2015-05-06'),
        //         max_x: new Date(endDate),//new Date('2016-06-07'),
        //         baselines: [{value: data.storage_capacity, label: "Reservoir Capacity: " + data.storage_capacity}],
        //         //xax_count: 7,
        //         max_y: data.storage_capacity,
        //         //max_y: 5000000,
        //         target: "#ts", // the html element that the graphic is inserted in
        //         x_accessor: 'date',  // the key that accesses the x value
        //         y_accessor: 'reservoir_storage' // the key that accesses the y value
        //         //   mouseover: function(d, i) {
        //         //     var month = d.time.getMonth() + 1;
        //         //     d3.select(pageLocation+' svg .mg-active-datapoint')
        //         //     .text('Date: ' + month + '/' + d.time.getDate() + ' Time: ' + d.time.getHours() + ':' + addZero(d.time.getMinutes()) + ' Count: '+ d.total)
        //         //   },
        //         //   markers: peak_marker,
        //       });
        //
        //       d3.selectAll('.label')
        //         .attr('transform', 'translate(-14, 0) rotate(-90)');
        //
        //        });
        //   // end dev
        //   });



    })
    .error(function(err) {
        console.log("Error: " + err);
    });

}
