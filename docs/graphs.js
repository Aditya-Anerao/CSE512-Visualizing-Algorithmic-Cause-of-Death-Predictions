// code from each of our graphs as functions

//NETWORK CODE
function network(source) {
    
    // read in source file from dropdown
    d3.json (source, function (error, my_data) {
        if (error) throw error;
        var svg = d3.select('svg#network'),
                width = +svg.attr('width'),
                height = +svg.attr('height');

        // set red and blue 
        var color =  d3.scaleOrdinal().range(["black", "#E66100"]);

        // create tooltip
        var tooltip = d3.select ("body")
            .append ("div")
            .attr ("class", "tooltip")
            .style ("opacity", 0);
    
        // create generic space
        var g = svg.append ("g")
                .attr ("class", "everything")

        my_data.links = my_data.links.filter(function(d) { 
            return d.weight !== 0;  
        });
        
        var simulation = d3.forceSimulation()
            .nodes (my_data.nodes)
            .force ('link', d3.forceLink().id(d => d.id))
            .force ('charge', d3.forceManyBody())
            .force("x", d3.forceX(function(d){
                    if(d.group === 0){
                        return width/3
                    } else if (d.group === 1){
                        return 2*width/3
                    } else {
                        return width/2 
                    }
                }))
                .force("y", d3.forceY(height/2))
            .force ('center', d3.forceCenter(width / 2, height / 2))
            .on ('tick', ticked);

            // get links data
            simulation.force ('link')
            .links (my_data.links);

            // set link widths by weight value
            let link = g.append ("g")
                .attr ("class", "links")
                .selectAll ("line")
                .data(my_data.links)
                .enter().append('line')
                .style ("stroke-width", function(d){ return d.weight*3; });

            // tooltip details on hover and mouseoff
            link.attr ('class', 'link')
                .on('mouseover.tooltip', function(d) {
                    tooltip.transition()
                        .duration(300)
                        .style("opacity", 0.8);
                    tooltip.html("<strong>Link details: </strong><p>- Source: "+ d.source.id + "<br>- Target: " + d.target.id + "<br>- Association: <b>"  + d.weight + "</b>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 10) + "px");
                })
                .on ("mouseout.tooltip", function() {
                    tooltip.transition()
                        .duration(100)
                        .style("opacity", 0);
                });

            // node drags
            let node = g.append ("g")
                .attr ("class", "nodes")
                .selectAll("circle")
                .data(my_data.nodes)
                .enter().append('g')
                .attr('class', 'node')
                .call (d3.drag()
                        .on ("start", dragstarted)
                        .on ("drag", dragged)
                        .on ("end", dragended));;
            /*node.filter(function(d){
                 return d.weight == 0;
            })
            .remove()*/ //Doesn't work to remove the extra nodes on highlight
            
            // create nodes with set radius and tooltip hover/mouseover details
            node.append ('circle')
                .text(function(d) { return d.id; })
                .attr ('r', 5)
                .attr ("fill", function(d) { return color(d.group);}) 	
                .attr("id", "isNode")
                .on ('mouseover.tooltip', function(d) {
                    tooltip.transition()
                        .duration(300)
                        .style ("opacity", 0.8);
                        tooltip.html("<strong>" + d.id + "</strong>")
                            .style ("left", (d3.event.pageX) + "px")
                            .style ("top", (d3.event.pageY + 10) + "px");
                })
                .on ('click', fade (0.02))
                .on ("mouseout.tooltip", function() {
                    tooltip.transition()
                        .duration(100)
                        .style("opacity", 0);
                })
                .on ("mousemove", function() {
                    tooltip.style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 10) + "px");
                })
                .on ('dblclick', fade(1))

         
    
            /*node.append("text")
                .attr("dx", 15)
                .text(function(d) { if (d.group == 1){return d.id; }});
            */
        
            // update locations after move
            function ticked() {
                link.attr ("x1", function(d){ return d.source.x; })
                    .attr ("y1", function(d){ return d.source.y; })
                    .attr ("x2", function(d){ return d.target.x; })
                    .attr ("y2", function(d){ return d.target.y; });
                node.attr ("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            }

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
            }
            function releasenode(d) {
                d.fx = null;
                d.fy = null;
            }

            var linkedByIndex = {};
                my_data.links.forEach(d => { linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
            });

            function isConnected(a, b) {
                return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
            }

            // fade non-highlighted nodes and links
            function fade(opacity) {
                return d => { node.style('stroke-opacity', function (o) {
                    var thisOpacity = isConnected(d, o) ? 1 : opacity;
                    this.setAttribute('fill-opacity', thisOpacity);
                    return thisOpacity;
                    });
                link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity))
                    .filter(function(d){
                    return d.weight == 0;
                    })
                    .remove();
                };
            }       

            // zoom in out functions
            function zoom_actions(){
                g.attr("transform", d3.event.transform)
            }

            var zoom_handler = d3.zoom()
                .on("zoom", zoom_actions);

            zoom_handler(svg);
            svg.on("dblclick.zoom", null);
        
            var select1 = d3.select("#searchNode")
                .append("select")
                .on('change.sn', searchNode);

            select1.selectAll("option")
                .attr ("class", "nodes")
                .data(my_data.nodes.filter(function(d){return d.group == 1;}))                
                .enter()
                .append("option")
                .text (function(d) {return d.id ;});
        
            function searchNode() {
                var selectedVal = d3.event.target.value;
                my_data.nodes.every(function(n){
                    if (n.id == selectedVal){
                        var d = n;
                        opacity =  0.02;
                        d3.selectAll(".node")
                            //.append("text")
                            //.text(function(d) { if (d.group == 1){return d.id; }})
                            .style("stroke-opacity", function(o) {
                            thisOpacity = isConnected(d, o) ? 1 : opacity;
                            this.setAttribute("fill-opacity", thisOpacity);
                            return thisOpacity;
                        });
                        
                        d3.selectAll(".link").style("stroke-opacity", function(o) {
                            return o.source === d || o.target === d ? 1 : opacity;

                        });
                        return false;
                    } 
                    return true;
                
                });
            }
        })
}

// HEATMAP AXIS CODE
function heatmapAxis(source) {
// Read the data
    d3.json(source, function(error, data) {
        if (error) throw error;

        var margin = {top: 80, right: 0, bottom: 230, left: 190},
            width = 100 - margin.left - margin.right,
            height = 1000 - margin.top - margin.bottom;

        var svg = d3.select('svg#heatmapAxis')
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

        svg.append("text") // Y Label
            .style("font-size", 11)
            .style("font-weight", 700)
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Cause of Death");

    })
}

// HEATMAP CODE
function heatmap(source) {
// Read the data
    d3.json(source, function(error, data) {
        if (error) throw error;

        var margin = {top: 80, right: 25, bottom: 230, left: 25},
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

        svg.append("text") // X Label
            .style("font-size", 11)
            .style("font-weight", 700)
            .attr("transform", "translate(" + (width/2) + " ," + 
                        (height + margin.top + 100) + ")")
            .style("text-anchor", "middle")
            .text("Symptom");

        // Build Y scales and axis:
        var y = d3.scaleBand()
            .range([ height, 0 ])
            .domain(myCauses)
            .padding(0.05);

        /*svg.append("g")
            .style("font-size", 10)
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove()
            .attr ("transform", "translate (" + 1600 + "," + 80 + ")");

        svg.append("text") // Y Label
            .style("font-size", 11)
            .style("font-weight", 700)
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Cause of Death"); */

        // Build color scale
        var myColor = d3.scaleSequential()
            .interpolator(d3.interpolateReds)
            .domain([1,100])

        // create a tooltip
        var tooltip = d3.select ("body")
            .append ("div")
            .attr ("class", "tooltip")
            .style("pointer-events", "none")
            .style ("opacity", 0);
        
        /*var tooltip = d3.select("body")
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
            .style("width", "200px")*/

        // Three functions that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            tooltip
            .style("opacity", 1)
            /*d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)*/
        }
        var mousemove = function(d) {
            tooltip
            .html("The association between '" + d.source + "' and '" + d.target + "' is: <b>" + d.weight + "</b>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px")
        }
        var mouseleave = function(d) {
            tooltip
            .style("opacity", 0)
            /*d3.select(this)
            .style("stroke", "none")
            .style("opacity", 1)*/
        }

        var click = function(d) {
            //console.log(d);
            d3.selectAll("rect.grid")
            .data(data)
            .style("opacity", 0.1)
            .filter(function(a) {
                return a.source === d.source || a.target === d.target;})
                .style("opacity", 1)
        }
        
        var dblclick = function(d) {
            //console.log(d);
            d3.selectAll("rect.grid")
            .data(data)
            .style("opacity", 1)
            .filter(function(a) {
                return a.source === d.source || a.target === d.target;})
                .style("opacity", 1)
        }

        // Make background gray
        svg.append("rect")
            .attr("width", width)
            .attr("height", (1000 - margin.top - margin.bottom))
            .attr("fill", "#939393");

        // Add the squares
        svg.selectAll()
            .data(data, function(d) {return d.target+':'+d.source;})
            .enter()
            .append("rect")
            .attr("class", "grid")
            .attr("x", function(d) { return x(d.target) })
            .attr("y", function(d) { return y(d.source) })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) { return myColor(d.weight*100)} )
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 1)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", click)
            .on("dblclick", dblclick)
    })
}

// PARALLEL COORDINATE
function parallelCoordinate(source) {
d3.json (source, function (error, data) {
    // throws error
    if (error) throw error;
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 100, bottom: 10, left: 0},
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
            .padding(.4)
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
        .attr("d", path)
        .filter(function(d){
                return d.weight == 0;
            })
        .remove();

    // draws line for the foreground
    svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(links)
        .enter().append("path")
        .attr("d", path)
        .filter(function(d){
            return d.weight == 0;
        })
        .remove();
    
    var tooltip = d3.select ("body")
            .append ("div")
            .attr ("class", "tooltip")
            .style("pointer-events", "none")
            .style ("opacity", 0);
    
    // create a tooltip
    /*var tooltip = d3.select("body")
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
                    .style("width", "200px");*/
    
    // Draw the axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) {
            if (d === "source") {
                d3.select(this).call(d3.axisLeft().scale(y[d]));
            } else {
                d3.select(this).call(d3.axisRight().scale(y[d]));
            }
        })
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
                            .on("click", mouseover)
                            .on("dblclick", mouseout);
    
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
            .html("The association between <br>'" + d.source + "' and '" + d.target + "' is: " + "<b>" + d.weight + "</b>")
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

// calling the functions

var dropdown = d3.select("#json_sources");
var dropdown1 = d3.select("#myList");
var source = dropdown.node().options[dropdown.node().selectedIndex].value;
var source1 = dropdown1.node().options[dropdown1.node().selectedIndex].value;
var source2 = "/cities.csv";

 var change = function(source, source1, source2) {
  if (source !== dropdown.node().options[dropdown.node().selectedIndex].value) {
      source = dropdown.node().options[dropdown.node().selectedIndex].value; 
      d3.select("div#searchNode").html("");
      
  }
  d3.selectAll("g").remove();

  network(source);
  heatmapAxis(source);
  heatmap(source);
  parallelCoordinate(source);  
     
  dropdown.on("change", change);
  if (source1 !== dropdown1.node().options[dropdown1.node().selectedIndex].value) {
    source1 = dropdown1.node().options[dropdown1.node().selectedIndex].value; 
  }
  d3.selectAll("g").remove();
  barchart(source1);
  dropdown1.on("change", change);
  map(source2);
}

change(source, source1, source2); 


// ====================== BARCHART BELOW ======================

function barchart (source1) {
    
    var svg = d3.select('svg#barchart')
    
    var margin = {top: 20, right: 20, bottom: 150, left: 70},
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
    
    var g = svg.append ("g")
                .attr ("class", "everything")

      d3.csv (source1, function(d, i, columns) {
        for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
        return d;
      }, function(error, data) {
             if (error) throw error;
        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // create a tooltip
        var tooltip = d3.select ("body")
            .append ("div")
            .attr ("class", "tooltip")
            .style("pointer-events", "none")
            .style ("opacity", 0);
          
        /*var tooltip = d3.select("body")
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
              .style("width", "200px")*/

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
            .html("The <b>" + d.key + "</b> algorithm yields an average probability of <b>" + d.value + "</b> for '" + d.state + "'")
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
          (Math.ceil(d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); }) / 10)*0.99)
        ]);

        var legend = g.append("g")
            .attr("class", "legend")
            .selectAll("g")
            .data(keys.slice())
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
          .attr("transform", function(d) { return "translate(" + x0(d.State) + ",0)";});

        barG.selectAll(".bars-container-middle")
          .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key], state: d.State};}); })
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
          .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key], state: d.State};}); })
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
        
        // text label for the x axis
        g.append("text")             
            .attr("transform", "translate(" + (width/2) + " ," + 
                        (height + margin.top + 65) + ")")
            .style("text-anchor", "middle")
            .text("Cause of Death");
        
        // text label for the y axis
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Average Probability"); 
      });
}

function map (source2){
    var svg = d3.select("svg#graph"),
        height = +svg.attr ('height'),
        width = +svg.attr ('width');
   console.log (source2);
    var projection = d3.geoRobinson()
      .scale(width / 2 / Math.PI)
      .scale(100)
      .translate([width / 2, height / 2])

    var path = d3.geoPath()
      .projection(projection);
    
    var url = "https://enjalot.github.io/wwsd/data/world/world-110m.geojson";
    d3.json(url, function(err, geojson) {
      svg.append("path")
        .attr("d", path (geojson))
        
    // create tooltip
    var tooltip = d3.select ("body")
        .append ("div")
        .attr ("class", "tooltip")
        .style ("opacity", 0);
    
    var g = svg.append("g");
        
    d3.csv("cities.csv", function(error, data) {
        g.selectAll ("circle")
           .data(data)
           .enter()
           .append ("a")
                .attr("xlink:href", function(d) {return "https://www.google.com/search?q="+d.city;})
           .append ("circle")
                .attr("cx", function(d) {return projection([d.lon, d.lat])[0];})
                .attr("cy", function(d) {return projection([d.lon, d.lat])[1];})
                .attr("r", 5)
                .style("fill", "red");         
});

g.selectAll("path")
    .enter()
      .append("path")
      .attr("d", path)
    })
}
