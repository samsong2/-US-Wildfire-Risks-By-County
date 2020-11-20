


var tl_map_features = function (d) {
    return {
        type: d.type,
        id: Number.parseInt(d.properties.GEOID),
        geometry: d.geometry,
        properties: d.properties
    }
}

var alber_map_features = function (d) {
    return {
        type: d.type,
        id: Number.parseInt(d.id),
        geometry: d.geometry,
        properties: d.properties
    }
}

// Draws the map lines and add colors
async function draw_hazard_map(map) {
    var width = 1000
    var height = 500
    var svg = d3.select(".container").select("svg")
    var projection = d3.geoAlbers()
        .scale(1000)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    var county_features = topojson.feature(us, us.objects.counties).features

    // Read the wildfire data file
    var wildfire = await d3.csv("./data/wildfire_county_data.csv")
        .then(function (wildfire) {

            // Format data & store in array & dictionary
            var dictByID = {};
            wildfire.forEach(function (d) {
                d.county = d.Name;
                d.state = d.state_abbrev;
                d.ave_hazard_score = +d.ave_hazard_score;
                d.median_hazard_score = +d.median_hazard_score;
                d.total_pop = +d.total_pop;
                d.pop_hazard_score = +d.pop_hazard_score;
                d.pop_change_pct = +d.pop_change_pct;
                dictByID[d.id] = {
                    county: d.county,
                    state: d.state,
                    ave_score: d.ave_hazard_score,
                    median: d.median_hazard_score,
                    total_pop: d.total_pop,
                    pop_score: d.pop_hazard_score,
                    pop_change_pct: d.pop_change_pct
                };
            });
            var formatNum1 = d3.format(".3r")
            var formatNum2 = d3.format(",")

            // Create sequential color scale based on oranges
            var color = d3.scaleSequential()
                .domain([0, 5])
                .interpolator(d3.interpolateOranges);

            // Add tooltip and tooltip actions
            var tooltip = d3.select("#tooltip");

            var mouseover = function (d) {
                d3.select(this)
                    .attr("class", "county active")
                    .raise();

                tooltip.style("opacity", 1)
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 15) + "px")
                    .html(dictByID[d.id].county + " (" + dictByID[d.id].state + ") <hr/>" +
                        " Average Hazard Score: " + formatNum1(dictByID[d.id].ave_score) +
                        "<br/> Pop-Adjusted Score: " + formatNum1(dictByID[d.id].pop_score) +
                        "<br/> 2020 Est Population: " + formatNum2(dictByID[d.id].total_pop) +
                        "<br/> Pop % Change 2010-20: " + formatNum1(dictByID[d.id].pop_change_pct) + "%");
            };
            var mouseout = function () {
                d3.select(this)
                    .attr("class", "county")
                    .lower();
                tooltip.style("opacity", 0)
            };

            // Add white lines between counties and color counties according to hazard score
            svg.append("g")
                .attr("class", "map")
                .attr("id", "hazard_by_county")
                .selectAll("path")
                .data(county_features)
                .enter().append("path")
                .attr("class", "county")
                .attr("d", path)
                .attr("id", function (d) { return d.id })
                .attr("fill", function (d) {
                    // check to see if id is in dictionary
                    // Dictionary will only contain counties on the mainland
                    if (dictByID[d.id] === undefined) {
                        console.log(d.id)
                        return color(0)
                    }
                    else {
                        return color(dictByID[d.id].ave_score);
                    }
                })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);


            // Add black lines for states
            /*    
            svg.append("path")
                .datum(topojson.mesh(us, us.objects.states, function (a, b) {
                    return a.id !== b.id;
                }))
                .attr("class", "states")
                .attr("d", path);
            */

        })
        .catch(function (err) {
            console.log("error: " + err);
        })

}

async function draw_weighted_hazard_map(map){

}

async function init() {

    // reads a topojson and return its map features
    var us_map = await d3.json("data/us_other_updated.json", function (error, us) {
        if (error)
            return console.error(error);
        console.log(us);
    });

    draw_hazard_map(us_map);

    draw_weighted_hazard_map(us_map);
}