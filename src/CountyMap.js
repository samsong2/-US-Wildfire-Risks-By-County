

  
// Draws the base map with just the counties
async function draw_map(){
    var width = 1000
    var height = 500
    var svg = d3.select(".container").select("svg")
    var projection = d3.geoAlbersUsa()


    var path = d3.geoPath()
        .projection(projection);


    var us = await d3.json("./data/tl_2019_us_county_basic.json", function (error, us) {
        if (error) 
            return console.error(error);
        console.log(us);
    });

    var counties = topojson.feature(us, us.objects.tl_2019_us_county);
    var county_features = topojson.feature(us, us.objects.tl_2019_us_county).features

    svg.selectAll(".counties")
        .data(county_features)
        .enter().append("path")
        .attr("id", function(d) { return  d.properties.COUNTYNS; })
        .attr("name", function(d){ return  d.properties.NAME;})
        .attr("state", function(d){ return d.properties.STATEFP})
        .attr("geoid", function(d){ return d.properties.GEOID})
        .attr("class", "county")
        .attr("d", path);
    
}

function init(){
    draw_map();
}