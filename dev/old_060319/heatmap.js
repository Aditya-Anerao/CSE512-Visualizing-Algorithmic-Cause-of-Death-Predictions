// Create dropdown menu
var dropdown = d3.select("#json_sources");
var change = function() {
  var source = dropdown.node().options[dropdown.node().selectedIndex].value;
  d3.selectAll("g").remove();

// Read the data
d3.json(source, function(error, data) {
  if (error) throw error;
  var margin = {top: 80, right: 25, bottom: 230, left: 160},
    width = 2400 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

  var svg = d3.select('svg#heatmap')
      .append ("g").attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

  var data = data.links;

  // Labels of row and columns -> unique identifier of the column called 'variable' and 'Cause'
  var myVars = d3.map(data, function(d){return d.target;}).keys()
  var myCauses = d3.map(data, function(d){return d.source;}).keys()

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(myVars)
    .padding(0.05);

  svg.append("g")
    .style("font-size", 10)
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)")
    .select(".domain").remove()

  // Build Y scales and axis:
  var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(myCauses)
    .padding(0.05);

  svg.append("g")
    .style("font-size", 10)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()
    .attr ("transform", "translate (" + 1600 + "," + 80 + ")");

  // Build color scale
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([1,100])

  // create a tooltip
  var tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("width", "200px")

  // Three functions that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip
      .html("The exact value of<br>" + d.source + " and " + d.target + " is: " + d.weight)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  // Make background pink
  svg.append("rect")
      .attr("width", "100%")
      .attr("height", (1000 - margin.top - margin.bottom))
      .attr("fill", "pink");

  // Add the squares
  svg.selectAll()
    .data(data, function(d) {return d.target+':'+d.source;})
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.target) })
      .attr("y", function(d) { return y(d.source) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.weight*100)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
})
}
                
  dropdown.on("change", change)
  change(); 

    /*// Add title to graph
    svg.append("text")
            .attr("x", 0)
            .attr("y", -50)
            .attr("text-anchor", "left")
            .style("font-size", "22px")
            .text("Cause of Death Heatmap");
    
    // Add subtitle to graph
    svg.append("text")
            .attr("x", 0)
            .attr("y", -20)
            .attr("text-anchor", "left")
            .style("font-size", "14px")
            .style("fill", "grey")
            .style("max-width", 400)
            .text("Heatmap of true cause of death and symptoms.");*/
    
         