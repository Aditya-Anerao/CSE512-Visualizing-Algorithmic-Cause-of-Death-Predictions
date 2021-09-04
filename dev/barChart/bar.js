var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 150, left: 70},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.2);
var x1 = d3.scaleBand()
    .padding(0.1);
var y = d3.scaleLinear()
    .rangeRound([(height / 1.75), 0]);
var z = d3.scaleOrdinal()
    .range(["#37A3D6", "#FF9400", "#ff0000"]);

var ddSelection = document.getElementById("myList").value;

var dropdown = d3.select("#myList")
    var change = function() {
      var source = dropdown.node().options[dropdown.node().selectedIndex].value;
      d3.selectAll("g").remove();

  d3.csv(source, function(d, i, columns) {
    for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
    return d;
  }, function(error, data) {
         if (error) throw error;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
      console.log(d);

      tooltip
        .html(d.key + " Algorithm yields an average probability of <br>" + d.value + " for this Cause of Death.")
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

    var keys = data.columns.slice(1);

    x0.domain(data.map(function(d) { return d.State; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([
      (Math.floor(d3.min(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); }) / 10)),
      (Math.ceil(d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); }) / 10)*0.12)
    ]);
    
    var legend = g.append("g")
        .attr("class", "legend")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter()
      .append("g")
        .attr("transform", function(d, i) { return "translate(" + i * (width / keys.length) + ", 0)"; });

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", z);

    legend.append("text")
        .attr("x", 25)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });

    // add the Y gridlines
    g.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + (height / 7) + ")")
      .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
            .ticks(6)
          );

    var barG = g.append("g")
      .selectAll("g")
      .data(data)
      .enter()
    .append("g")
      .attr("transform", function(d) { return "translate(" + x0(d.State) + ",0)"; });

    barG.selectAll(".bars-container-middle")
      .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key] }; }); })
      .enter()
    .append("rect")
        .attr("class", function(d) { 
          if (d.value > 75) return 'bars-container-middle clinically-significant-pulsing-rect';
          else return 'bars-container-middle';
        })
        .attr("transform", "translate(0," + (height / 7) + ")")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return 0; })
        .attr("width", x1.bandwidth())
          .transition()
          .delay(function (d,i){ return 750;}) // this is to do left then right bars
          .duration(250)
          .attr('height', function( d ) { return ((height / 1.75));});;

    barG.selectAll(".bars")
      .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
      .enter()
      .append("rect")
        .attr("class", "bars")
        .attr("transform", "translate(0," + (height / 7) + ")")
        .attr("x", function(d) { return x1(d.key); })
        .attr("width", x1.bandwidth())
        .attr("fill", function(d) { return z(d.key); })
        .attr("y", (height / 2))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
          .transition()
          .delay(function (d,i){ return i * 250;}) // this is to do left then right bars
          .duration(250)
          .attr("y", function(d) { return y(d.value); })
          .attr('height', function( d ) { return ((height / 1.75))  - y( d.value );})

    g.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + (height / 1.4) + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")	
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)")
        .text(function (d) {
          if(d.length > 60) { return d.substring(0,14)+'...'; } 
          else { return d; }
        });

    g.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0," + (height / 7) + ")")
        .call(d3.axisLeft(y).ticks(6));
  });
  }

  dropdown.on("change", change)
  change(); 
