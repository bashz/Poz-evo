var stat = d3.select("#stat"),
    sWidth = 500,
    sHeight = 300;

var x = d3.scaleBand().rangeRound([0, sWidth]),
    y = d3.scaleLinear().rangeRound([sHeight, 0]);

var g = stat.append("svg")
    .attr("width", sWidth)
    .attr("height", sHeight)
  .append("g");

var data =[];

g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.i); })
      .attr("y", function(d) { return y(d.total); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return sHeight - y(d.value); });

dispatch.on("step", function (stats) {
  data.push(stats);
  x.domain(data.map(function(d) { return d.i; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]);

  var bars = g.selectAll(".bar").data(data, function(d) { return d.i; }) // (data) is an array/iterable thing, second argument is an ID generator function

  bars.exit()
    .transition()
      .duration(150)
    .attr("y", y(0))
    .attr("height", sHeight - y(0))
    .style('fill-opacity', 1e-6)
    .remove();

  // data that needs DOM = enter() (a set/selection, not an event!)
  bars.enter().append("rect")
    .attr("class", "bar")
    .attr("y", y(0))
    .attr("fill", function(d){return d.color})
    .attr("height", sHeight - y(0));

  // the "UPDATE" set:
  bars.transition().duration(150).attr("x", function(d) { return x(d.i); }) // (d) is one item from the data array, x is the scale object from above
    .attr("width", x.bandwidth()) // constant, so no callback function(d) here
    .attr("y", function(d) { return y(d.total); })
    .attr("height", function(d) { return sHeight - y(d.total); });
})