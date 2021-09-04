var dropdown = d3.select("#json_sources");
var change = function() {
  var source = dropdown.node().options[dropdown.node().selectedIndex].value;
  d3.selectAll("g").remove();

  d3.json (source, function (error, data) {
    // throws error
    if (error) throw error;
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 0, bottom: 10, left: 0},
      width = 1200 - margin.left - margin.right,
      height = 1800 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("svg.parallelCoordinate")
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

    // Extract the links between symptoms and causes
    var links = data.links;

    // Build the Y scale spacing within each dimension
    var dimensions = d3.keys(links[0]).filter(function(d) { return d != "weight" });
    var y = {};
    var yCounter = {};
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
            .padding(0.2)
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
                    .style("width", "200px");
    
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
        .text(function(d) { 
          if (d === "source") {
            return "Cause";
          } else {
            return "Symptom";
          }
        })
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
        name = "source";
      } else {
        name = "target";
      }
      if (typeof d === "string") {
        projection.classed("inactive", function(p) { return p[name] !== d; });
        projection.filter(function(p) { return p[name] === d; }).each(moveToFront);
        ordinal_labels.classed("inactive", function(p) { return p[name] !== d; });
        ordinal_labels.filter(function(p) { return p[name] === d;}).each(moveToFront);
      } else {
        projection.classed("inactive", function(p) { return p !== d; });
        projection.filter(function(p) { return p === d; }).each(moveToFront);
        ordinal_labels.classed("inactive", function(p) { return p !== d.name; });
        ordinal_labels.filter(function(p) { return p === d.name; }).each(moveToFront);
        tooltip
          .style("opacity", 1);
        d3.select(this)
          .style("opacity", 1);
        tooltip
          .html("The exact value of<br>" + d.source + " and " + d.target + " is: " + d.weight)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");
        }
      }

    function mouseout(d) {
      svg.classed("active", false);
      projection.classed("inactive", false);
      ordinal_labels.classed("inactive", false);
      tooltip.style("opacity", 0);
    }

    function moveToFront() {
      this.parentNode.appendChild(this);
    }
  })
}

dropdown.on("change", change);
change(); 