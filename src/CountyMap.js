


// Draws the map lines and add colors
async function draw_map() {
    var width = 1000
    var height = 500
    var svg = d3.select(".container").select("svg");
    var projection = d3.geoAlbers()
        .scale(1000)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    // Read the county topojson file
    var us = await d3.json("./data/us_other.json", function (error, us) {
        if (error)
            return console.error(error);
        console.log(us);
    });

    var county_features = topojson.feature(us, us.objects.counties).features

    // draw blank counties
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(county_features)
        .enter().append("path")
        .attr("class", "county")
        .attr("id", function(d){return d.id})
        .attr("d", path)

    // Add black lines for states    
    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) {
            return a.id !== b.id;
        }))
        .attr("class", "states")
        .attr("d", path);
}

// Testing splitting up drawing the map and adding color
async function draw_hazard_map() {
    var svg = d3.select(".container").select("svg");

    // Create sequential color scale based on oranges
    var color = d3.scaleSequential()
        .domain([0, 5])
        .interpolator(d3.interpolateOranges);

    // Read the wildfire data file
    var wildfire = await d3.csv("./data/wildfire_county_data.csv")
        .then(function (wildfire) {

            // Format data & store in array & dictionary
            //var aveByID = {};
            var dictByID = {};
            wildfire.forEach(function (d) {
                //aveByID[d.id] = +d.ave_hazard_score;
                d.county = d.Name;
                d.state = d.state_abbrev;
                d.ave_hazard_score = +d.ave_hazard_score;
                d.median_hazard_score = +d.median_hazard_score;
                d.total_pop = +d.total_pop;
                d.pop_hazard_score = +d.pop_hazard_score;
                d.pop_change_pct = +d.pop_change_pct;
                dictByID[d.id] = {
                    county: d.county,
                    id: d.id,
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
                tooltip.style("opacity", 1)
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 15) + "px")
                    .html(dictByID[d.id].county + " (" + dictByID[d.id].state + ") <hr/>" +
                        " Average Hazard Score: " + formatNum1(dictByID[d.id].ave_score) +
                        "<br/> Pop-Adjusted Score: " + formatNum1(dictByID[d.id].pop_score) +
                        "<br/> 2020 Est Population: " + formatNum2(dictByID[d.id].total_pop) +
                        "<br/> Pop % Change 2010-20: " + formatNum1(dictByID[d.id].pop_change_pct) + "%");
            };
            var mouseout = function () { tooltip.style("opacity", 0) };

            // Add white lines between counties and color counties according to hazard score
            svg.selectAll(".county")
                //.data(dictByID, function(d) { return d.id; }) // attempt to join by id
                .data(Object.values(dictByID))
                .join()
                .attr("fill", function (d) {
                        return color(d.ave_score);
                })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);

        })
        .catch(function (err) {
            console.log("error: " + err);
        })
}

function init() {
    draw_map();
    draw_hazard_map();
}