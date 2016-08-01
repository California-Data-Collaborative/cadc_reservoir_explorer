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

  // Put layer data into a JS object
  var reservoir_storage = {
    user_name: 'thenamesdave',
    type: 'cartodb',
    sublayers: [{ 
      sql: "SELECT * FROM reservoir_levels_1 WHERE (date = ('2016-06-07'))",
      cartocss: storageStyles,
      interactivity: ['precent_full', 'name', 'reservoir_storage', 'storage_capacity', 'dam_id', 'date']
    }]
  };

  var reservoir_capacity = {
    user_name: 'thenamesdave',
    type: 'cartodb',
    sublayers: [{
      sql: "SELECT * FROM reservoir_levels_1 WHERE (date = ('2016-06-07'))",
      cartocss: capacityStyles
    }]
  };


  // For storing the sublayers
  var sublayers = [];
  var sublayers_design = []

  // Pull tiles from OpenStreetMap
  L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }).addTo(map);

  // Add data layers to map
  cartodb.createLayer(map,reservoir_capacity, https=true)
  .addTo(map, 0)
  .done(function(layer) {
      // do stuff
       // var legend1 = new cdb.geo.ui.Legend({
       //     type: "bubble",
       //     show_title: true,
       //     title: "Reservoir Storage",
       //     data: [
       //       { value: "26315" },
       //       { value: "4973535" },
       //       { name: "graph_color", value: "#2167AB" }
       //     ]
       //   });
       //   var legend2 = new cdb.geo.ui.Legend({
       //     type: "bubble",
       //     show_title: true,
       //     title: "Reservoir Capacity",
       //     data: [
       //       { value: "26315" },
       //       { value: "4973535" },
       //       { name: "graph_color", value: "#FFCC00" }
       //     ]
       //   });
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
   { value: "26315" },
   { value: "4973535" },
   { name: "graph_color", value: "#333" }
   ]
 });
  var stackedLegend = new cdb.geo.ui.StackedLegend({
    legends: [legend, bubble]
  });
  $('#map').append(stackedLegend.render().el);
});




cartodb.createLayer(map,reservoir_storage, https=true)
.addTo(map, 1)
.done(function(layer) {

  for (var i = 0; i < layer.getSubLayerCount(); i++) {
    sublayers[i] = layer.getSubLayer(i);
  };

      //sublayers[0].hide()


      sublayers[0].setInteraction(true)
      layer.leafletMap.viz.addOverlay({
        type: 'tooltip',
        layer: sublayers[0],
        template: '<div class="cartodb-tooltip-content-wrapper dark"> <div class="cartodb-tooltip-content"> <h4>Reservoir Name</h4> <p>{{name}}</p> <h4>Percent of Capacity</h4> <p>{{precent_full}}</p> <h4>Storage (AF)</h4> <p>{{reservoir_storage}}</p> <h4>Total Capacity (AF)</h4> <p>{{storage_capacity}}</p> </div> </div>', 
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
         $.getJSON("https://thenamesdave.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20reservoir_levels_1%20WHERE%20dam_id%20=%20%27"+data.dam_id+"%27", function(tableData) {

        
    //       // var peak_marker = [{ 
    //       //   'time': new Date(peakDate),
    //       //   'label': 'Overall peak of ' + weeklyPeak + ' pedestrians.'
    //       // }];
    
     tsData = MG.convert.date(tableData.rows, 'date', '%Y-%m-%dT%XZ');

          MG.data_graphic({
            //animate_on_load: true,
            data: tsData,
            full_width: true,
            title: data.name,
            //buffer: 10,
           
            //yax_units: 'AF',
            //y_axis: false,
            small_text: true,
            y_label: 'Water Volume (AF)',



            //full_height:true,
             min_x: new Date('2015-05-06'),
             max_x: new Date('2016-06-07'),
             baselines: [{value: data.storage_capacity, label: "Reservoir Capacity: " + data.storage_capacity}],
        //     xax_count: 7,
           max_y: 5000000,
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
          
           });
// end dev
        });



$( function() {
  $( "#date" ).datepicker({
    dateFormat: "yy-mm-dd",
    maxDate: "2016-06-07",
    minDate: "2015-05-06",
    onSelect: function(dateText) {
      query = "SELECT * FROM reservoir_levels_1 WHERE (date = '" + this.value + "')";
      sublayers[0].setSQL(query);
            //sublayers[0].setSQL(query);
            console.log(sublayers);
          }

        });
} );


// $(function() {
//   $( "#dateSlider" ).slider({
//     range: "max",
//     value: 2014, // would be better if programatic
//     //range: "range",
//     //values: [2009, 2015],
//     min: 2009, // would be better if programatic
//     max: 2015, // would be better if programatic
//     slide: function( event, ui ) {
//       $( "#date" ).val(ui.value);
//       date = ui.value
//       //years = ui.values
//       query = "SELECT * FROM reservoir_levels WHERE (date >= ('2015-06-08T19:30:00-07:00') AND date <= ('2015-06-20T04:39:25-07:00'))";
//       sublayers[0].setSQL(query);
//     }
//   });
//   $( "#date" ).val( $( "#dateSlider" ).slider( "value" ));
// });



})
.error(function(err) {
  console.log("error: " + err);
});

}