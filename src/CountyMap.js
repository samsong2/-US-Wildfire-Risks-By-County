
// Create sequential color scale based on oranges
var color = d3.scaleSequential()
    .domain([0, 5])
    .interpolator(d3.interpolateOranges);


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
async function draw_map() {
    var width = 1000
    var height = 500
    var svg = d3.select(".container").select("svg");
    var projection = d3.geoAlbers()
        .scale(1000)
        .translate([width / 2, height / 2]);

    var projection = d3.geoAlbers();
    var path = d3.geoPath()
        .projection(projection);

    var us = await d3.json("data/us_other_updated.json", function (error, us) {
        if (error)
            return console.error(error);
        console.log(us);
    });
    var county_features = topojson.feature(us, us.objects.counties).features

    // draw blank counties
    svg.append("g")
        .attr("class", "map")
        .attr("id", "hazard_by_county")
        .selectAll("path")
        .data(county_features)
        .enter().append("path")
        .attr("class", "county")
        .attr("id", function (d) { return d.id })
        .attr("d", path)
        .attr("fill", "transparent");

    // Add black lines for states    
    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) {
            return a.id !== b.id;
        }))
        .attr("class", "states")
        .attr("d", path);

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
                    id: d.id,
                    state: d.state,
                    ave_score: d.ave_hazard_score,
                    median: d.median_hazard_score,
                    total_pop: d.total_pop,
                    pop_score: d.pop_hazard_score,
                    pop_change_pct: d.pop_change_pct
                };
            });


            // Add tooltip and tooltip actions
            var tooltip = d3.select("#tooltip");
            // tooltip formating
            var formatNum1 = d3.format(".3r")
            var formatNum2 = d3.format(",")

            var mouseover = function (d) {
                d3.select(this)
                    .attr("class", "county active")
                    .raise();

                tooltip.style("opacity", 1)
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 15) + "px")
                    .html(d.county + " (" + d.state + ") <hr/>" +
                        "Average WHP: " + formatNum1(d.ave_score) +
                        "<br/> Population-Weighted Average WHP: " + formatNum1(d.pop_score) +
                        "<br/> 2020 Estimated Population: " + formatNum2(d.total_pop) +
                        "<br/> Population % Change 2010-20: " + formatNum1(d.pop_change_pct) + "%");
            };

            var mouseout = function () {
                d3.select(this)
                    .attr("class", "county")
                    .lower();
                tooltip.style("opacity", 0)
            };

            // Add white lines between counties and color counties according to hazard score
            // the csv data is joined to the map data by id
            svg.selectAll(".county")
                .data(Object.values(dictByID), function (d) { return d.id; })  
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

function add_toggle(){

    d3.select('#map_options').selectAll("input")
        .on("change", function(){
        console.log(this.value)
        show(this.value)
    });
}

/* 
    ramp() creates an image of a smooth/contnuous color scale
    in canvas and then returns its DataURL
*/
function ramp(color, n = 256) {
    var canvas = d3.create("canvas")
            .attr("width", n)
            .attr("height", 1)
            .attr("id", "canvas");
  
    var context = canvas.node().getContext("2d");
    for (let i = 0; i < n; ++i) {
        // normalize the color?
        context.beginPath();
        context.rect(i, 0, 1, 1);
        context.fillStyle = color(i / (n - 1));
        context.fill();
        context.closePath();
    }


    return canvas.node().toDataURL();
  }

/* 
    draw_legend() draws the Wildfire Hazard Potential Legend
    on the bottom lefthand corner of the graph.
*/

function draw_legend(){
    var svg = d3.select(".container").select("svg");
    var height = 500
    var width = 1000

    title = "Wildfire Hazard Potential";
    tickSize = 5;
    legend_width = 200; 
    legend_height = 10;
    marginTop = 18;
    marginRight = 0;
    marginBottom = 50 + tickSize;
    marginLeft = 100;
    ticks = width / 64;
    position = height - 100;
    
    // draw the legend on the bottom left hand corner
    svg.append("image")
        .attr("id", "legend")
        .attr("x", marginLeft)
        .attr("y", height - marginBottom)
        .attr("width", legend_width)
        .attr("height", legend_height)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()));
    
    // add in the ticks
    var legendScale = d3.scaleLinear()
        .domain([0, 5])
        .range([0, legend_width]);

    var legendAxis = d3.axisBottom(legendScale)
        .ticks(6)
        .tickSize(legend_height + tickSize);
    
    // translate to legend location
    svg.append("g")
        .attr("class", "legend axis")
        .attr("transform", "translate("+ marginLeft + "," + (height - marginBottom) + ")")
        .call(legendAxis);
}

function show(attribute){

    // verify attribute before changing color?
    if(attribute != "pop_score" && attribute != "ave_score")
        return false;

    d3.select('#hazard_by_county').selectAll(".county")
        .transition()
		.duration(2000)
        .attr("fill", function (d) {
            return color(d[attribute]);
        })
    return true;
}

async function init() {
    draw_map();
    draw_legend();
    add_toggle();
}
