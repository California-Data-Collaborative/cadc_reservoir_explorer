








function drawBar(data){
  // console.log(data)

  d3.select('#bar').remove()
  var svg = d3.select("#barContainer").append("svg").attr("id", "bar")

var width = "100%",
    height = 20,
    perc_so_far = 0;


//console.log(d3.sum(data));
var total_time = data[1]//d3.sum(data);
var bar_x = 0;
var chart = d3.select("#bar")
	.attr("width", width)
	.attr("height", height);
	bar_x = 0;
	//var chart_width = chart.style("width").replace("px", "");
var chart_width = parseInt(d3.select("#bar").style("width"));
var colors = [
  '#2167AB',
  // '#ff471a',
  'rgba(0,0,0,0)'
],
color = d3.scale.ordinal()
  .range(colors);
var bar = chart.selectAll("g")
	.data(data)
	.enter().append("g");
	// console.log(bar);
bar.append("rect")
	.attr("width", function(d) { return ((d/total_time)*100) + "%"; } )
	.attr("x", function(d) {
		var prev_perc = perc_so_far;
		var this_perc = 100*(d/total_time);
		perc_so_far = perc_so_far + this_perc;
		// console.log("perc_so_far:" + perc_so_far + "; this_perc:" + this_perc + "; prev_perc:" + prev_perc + ";");
		return 0 ;
	})
	.attr("height", height)
  .attr("rx", "4px")

	.attr("fill",  function(d) { return (color(d)) } );

  // bar.merge()

perc_so_far = 0;
bar.append("text")
	.attr("x", function(d) {
		var prev_perc = perc_so_far;
		var this_perc = 100*(d/total_time);
		perc_so_far = perc_so_far + this_perc;
		// console.log("perc_so_far:" + perc_so_far + "; this_perc:" + this_perc + "; prev_perc:" + prev_perc + ";");
		return '6px';
	})
	//.attr("y", 11)
	.attr("dy", "1.35em")

	.text(function(d, i) {
    if (i == 0) {

      return d.toLocaleString() + ' AF'; }

    })

d3.select(window).on('resize', resize);

function resize () {
	var width = parseInt(d3.select("#bar").style("width"));
	//console.log(width);
	//console.log(bar);
}

}

// d3.select('#detailBars').remove()
//
// // Create svg to include circles and text labels
//   var svg = d3.select("#barContainer").append("svg").attr("id", "detailBars")
//   // Create circles of total system capacity, used storage, and historical average for that day
//   var bars = svg.selectAll("rect")
//   .data(volumes)
//   .enter()
//   .append("circle")
//   .attr("r", function(d){
//     return (70* d.volume/totalCapacity); })
//     .attr("cx", 80)
//     .attr("cy", 80)
//     .style("fill", function(d){
//       return d.fill; })
//       .style("stroke", function(d){
//         return d.stroke; })
//         .style("stroke-width", 4)
//         .style("stroke-dasharray", "5, 5")
//         ;

// var scale = d3.scaleLinear()
//       .domain([0, 50])
//       .range([0, 100]);
//
//   var bars = d3.select("#bar")
//       .selectAll("div")
//       .attr("id","bar")
//       .data(data);
//
//   // enter and update selection
//   bars
//     .enter().append("div")
//     .merge(bars)
//     .style("width", function (d) {return scale(d) + "%";})
//     .text(function (d) {return d;});
//
//
//   // exit selection
//   bars
//       .exit().remove();


// function drawStateStorage(data){
//   // Remove previous total capacity circles and labels
//   d3.select('#totalCircles').remove()
//
//   var volumes = [{title: "Total Capacity", volume: data.rows[0]['cap'], fill: "#FFCC00", stroke: "none", y: 20},
//   {title: "Recorded Storage", volume: data.rows[0]['stor'], fill: "#2167AB", stroke: "none", y: 40},
//   {title: "Historical Average", volume: data.rows[0]['hist'], fill: "none", stroke: "#ff471a", y: 60}]
//   var totalCapacity = (data.rows[0]['cap']);
//
//   // Create svg to include circles and text labels
//   var svg = d3.select("#total").append("svg").attr("id", "totalCircles")
//   // Create circles of total system capacity, used storage, and historical average for that day
//   var circles = svg.selectAll("circle")
//   .data(volumes)
//   .enter()
//   .append("circle")
//   .attr("r", function(d){
//     return (70* d.volume/totalCapacity); })
//     .attr("cx", 80)
//     .attr("cy", 80)
//     .style("fill", function(d){
//       return d.fill; })
//       .style("stroke", function(d){
//         return d.stroke; })
//         .style("stroke-width", 4)
//         .style("stroke-dasharray", "5, 5")
//         ;
//         // Add labels
//         svg.selectAll('text')
//         .data(volumes)
//         .enter()
//         .append("text")
//         .attr('x', 180)
//         .attr('y', function(d) {return d.y;})
//         // Max sig figs will show to the hundred thousand gallons
//         .text(function(d) {return (d.title + ": " + d.volume.toLocaleString('en', {maximumSignificantDigits : 3}) +' AF'); })
//         // .style("font-size", "1.0rem")
//         ;
//       }
