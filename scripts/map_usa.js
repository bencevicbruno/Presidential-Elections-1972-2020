function setup_MapUSA() {
    // For all of the code below, http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922 was referenced a lot.
    const ID_MAP_USA_TOOLTIP = "#map_usa_tooltip"

    function createTooltip(stateID, stateName) {
        return "<h4>#" + stateID + " " + stateName + "</h4>"
    }

    function mouseOverMapUSA(data, index) {
        d3.select(ID_MAP_USA_TOOLTIP)
            .transition()
            .duration(200)
            .style("opacity", .9);

        d3.select(ID_MAP_USA_TOOLTIP)
            .html(createTooltip(index + 1, data.n))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    function mouseOutMapUSA(data) {
        d3.select(ID_MAP_USA_TOOLTIP)
            .transition()
            .duration(500)
            .style("opacity", 0);
    }

    d3.json("/data/map_usa_geo.json", function (data) {

        var svg = d3.select("#map_usa"),
            width = svg.style("width"),
            height = svg.style("height");

        d3.select("#map_usa")
            .selectAll(".map_usa_state")
            .data(data)
            .enter()
            .append("path")
            .attr("class", "map_usa_state")
            .attr("d", function (d) { 
                return d.d; })
            .style("fill", function (d, i) {
                function convert(t, a, b, c, d) {
                    return c + (d - c) / (b - a) * (t - a)
                }

                let shade = ((i / 50.0) * 255 + 64 * i) % 256 // determined randomly
                shade = convert(shade, 0, 255, 64, 255)
                
                return "rgb(" + shade + " " + shade + " 255)"
            })
            .attr("transform","scale(0.8) translate(120, 20)")
            .on("mouseover", mouseOverMapUSA)
            .on("mouseout", mouseOutMapUSA);
    })
}

setup_MapUSA()