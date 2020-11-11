

  
// Draws the base map with just the counties
async function draw_map(){
    var us = await d3.json("./data/tl_2019_us_county_topojson_simplified.json", function (error, us) {
        if (error) 
            return console.error(error);
        console.log(us);
    });


    var svg = d3.select(".container").select("svg")
    
    svg.append("path")
        .datum(topojson.feature(us, us.objects.tl_2019_us_county))
        .attr("d", d3.geoPath().projection(d3.geoMercator()))

}

function init(){
    draw_map();
}