# US-Wildfire-Risks-By-County

The map can be viewed at https://pages.github-dev.cs.illinois.edu/samsong2/US-Wildfire-Risks-By-County/ 
and should display an US Wildfire Hazard map consisting of all 48 mainland states and their counties. 

The map allows users to view more informaiton about each county by hovering over the county.
Users can also switch between viewing the Wildfire Hazard map by county or view the Wildfire Hazard 
weighted by population via the radio buttons.

The shapes for the map are stored as a TOPOJson file under data/us_other_updated.json. 
The updated file contains an update to the FIPS for when Shannon County, SD became Oglala Lakota, SD in 2014 
https://www.cdc.gov/nchs/nvss/bridged_race/county_geography-_changes2015.pdf. 

The data corresponding to each counties Wildfire Hazard Potential is stored under data/wildfire_county_data.csv.