var color =  d3.scaleOrdinal().range(["#0C7BDC", "#E66100"]);
        
        var tooltip = d3.select ("body")
	       .append ("div")
	       .attr ("class", "tooltip")
	       .style ("opacity", 0);
       
        var dropdown = d3.select("#json_sources")
        var change = function() {
            var source = dropdown.node().options[dropdown.node().selectedIndex].value;
            d3.selectAll("g").remove();

        d3.json (source, function (error, my_data) {
            if (error) throw error;
            var svg = d3.select('svg#network'),
                  width = +svg.attr('width'),
                  height = +svg.attr('height');
                        
            var g = svg.append ("g")
                  .attr ("class", "everything")
                  //.attr ("transform", "translate("+(width-140)+","+(height-300)+")");
            
            var simulation = d3.forceSimulation()
                .nodes (my_data.nodes)
                .force ('link', d3.forceLink().id(d => d.id))
                .force ('charge', d3.forceManyBody())
                .force("x", d3.forceX(function(d){
                    if(d.group === 2){
                        return width/3
                    } else if (d.group === 3){
                        return 2*width/3
                    } else {
                        return width/2 
                    }
                }))
                .force("y", d3.forceY(height/2))
                .force ('center', d3.forceCenter(width / 2, height / 2))
                .on ('tick', ticked);
                 
                simulation.force ('link')
                .links (my_data.links);

                let link = g.append ("g")
                    .attr ("class", "links")
                    .selectAll ("line")
                    .data(my_data.links)
                    .enter().append('line')
                    .style ("stroke-width", function(d){ return d.weight*3; });
                
                link.attr ('class', 'link')
                    .attr('class', 'link')
                    .on('mouseover.tooltip', function(d) {
                        tooltip.transition()
                            .duration(300)
                            .style("opacity", 0.8);
                        tooltip.html("<strong>Link details: </strong><p>-Source: "+ d.source.id + "<br>-Target: " + d.target.id + "<br>-Weight: "  + d.weight)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 10) + "px");
    	           });
                
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

                var clickFlag = false;
            
                node.append ('circle')
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
                    .on ('click', fade(0.03))
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

                node.append ('text')
                    .attr ('dx', 12)
                    .attr ('dy', '0.35em')
                    .attr ('font-size', 12)
                    .text (function(d){ return d.name; });

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

                function fade(opacity) {
                    return d => { node.style('stroke-opacity', function (o) {
                        var thisOpacity = isConnected(d, o) ? 1 : opacity;
                        this.setAttribute('fill-opacity', thisOpacity);
                        return thisOpacity;
                      });
                    link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));
                    };
                }       

                function zoom_actions(){
                    g.attr("transform", d3.event.transform)
                }
            
                var zoom_handler = d3.zoom()
                    .on("zoom", zoom_actions);

                zoom_handler(svg);
                svg.on("dblclick.zoom", null);
        })
    }
                
    dropdown.on("change", change)
    change(); 
