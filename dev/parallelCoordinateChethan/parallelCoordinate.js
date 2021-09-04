// set the dimensions and margins of the graph
var margin = {top: 30, right: 10, bottom: 10, left: 0},
  width = 1200 - margin.left - margin.right,
  height = 1800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("svg.my_dataviz")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// array unique function
Array.prototype.unique = function() {
  var arr = [];
  for(var i = 0; i < this.length; i++) {
      if(!arr.includes(this[i])) {
          arr.push(this[i]);
      }
  }
  return arr; 
}
// Parse the Data
d3.queue()
  .defer(d3.json, "AP.json")
  .defer(d3.json, "Bohol.json")
  .defer(d3.json, "Dar.json")
  .defer(d3.json, "Mexico.json")
	.await(ready);

function ready(error, ap, bohol, dar, mexico) {

  // throws error
	if (error) throw error;

  // Extract the links between symptoms and causes along with their
  //  mean value  
  /// combine json objects into 1 and remove weight property
  var jsonObjArray = [ap, bohol, dar, mexico];
  var arrayLength = jsonObjArray.length;
  const result = [];
  for (var i = 0; i < arrayLength; i++) {
    jsonObj = jsonObjArray[i].links;
    for (var key in jsonObj) {
      if(jsonObj.hasOwnProperty(key)){
        delete jsonObj[key].weight;
        result.push(jsonObj[key]);
      }
    }
  }
  /// remove duplicate nodes
  seenNodes = [];
  uniqueNodes = [];
  for (var i = 0; i < result.length; i++) {
    source = result[i].source;
    target = result[i].target;
    var indicator = false;
    var j = 0;
    while (j < seenNodes.length) {
      sourceSeen = seenNodes[j].source;
      targetSeen = seenNodes[j].target;
      if (source === sourceSeen && target === targetSeen) {
        indicator = true;
      }
      j = j + 1;
    }
    if (!indicator) {
      seenNodes.push(result[i]);
      uniqueNodes.push(result[i]);
    }
  }
  var links = uniqueNodes;

  // Build the Y scale spacing within each dimension
  var dimensions = d3.keys(links[0]);
  var y = {}
  var yCounter = {}
  for (i in dimensions) {
    name = dimensions[i];
    var array = [];
    for (var key in links) {
      if(links.hasOwnProperty(key)) {
        var newLinks = links[key];
        array.push(newLinks[name]);
      }
    }
    yCounter[name] = array.unique().length;
    y[name] = d3.scalePoint()
                  .domain(array)
                  .range([height, 0]);
  }

  // Build the X scale spacing for each dimension
  var x = d3.scalePoint()
          .range([0, width])
          .padding(1)
          .domain(dimensions);

  // The path function take a node of the json as input, and return x and y coordinates of the line to draw for this node.
  function path(d) {
    return d3.line()(dimensions.map(function(p) { 
      return [x(p), y[p](d[p])];
    }));
  }
  
  // draws lines for the background
  svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(links)
    .enter().append("path")
      .attr("d", path);

  // draws line for the foreground
  svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(links)
    .enter().append("path")
      .attr("d", path);
  
  // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
      .attr("class", "title")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d.toUpperCase(); })
      .style("fill", "black")
      .style("font-size", "12px");
  
  // when i hover over a text, highlight
  var ordinal_labels = svg.selectAll("text")
                          .on("mouseover", mouseover)
                          .on("mouseout", mouseout);
  
  // when I hover over a line, highlight
  var projection = svg.selectAll(".background path, .foreground path")
                      .on("mouseover", mouseover)
                      .on("mouseout", mouseout);

// function that describes how mouseover works
  function mouseover(d, position) {
    svg.classed("active", true);
    if (position < yCounter.source && position >= 0) {
      name = "source"
    } else {
      name = "target"
    }
    projection.classed("inactive", function(p) { return p[name] !== d; });
    projection.filter(function(p) { return p[name] === d; }).each(moveToFront);
    ordinal_labels.classed("inactive", function(p) { return p[name] !== d; });
    ordinal_labels.filter(function(p) { return p[name] === d;}).each(moveToFront);
  }

  function mouseout(d) {
    svg.classed("active", false);
    projection.classed("inactive", false);
    ordinal_labels.classed("inactive", false);
  }

  function moveToFront() {
    this.parentNode.appendChild(this);
  }
}