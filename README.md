# Interactive Earthquake Map  

Using JavaScript, Leaflet, and data from USGS to visualize recent earthquake activity with an interactive map.  


## Background  
 
<img src="Images/1-Logo.png" width="30%">  

The USGS is responsible for providing scientific data about natural hazards, the health of our ecosystems and environment; and the impacts of climate and land-use change. Their scientists develop new methods and tools to supply timely, relevant, and useful information about the Earth and its processes. This project aimed to build the tools to visualize USGS earthquake data.  


## Data Sources  

### [USGS GeoJSON Feed](http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)  
* [Past Hour](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson)  
* [Past Day](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson)  
* [Past Week](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson)  
* [Past Month](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson)  

### [Tectonic Plates](https://github.com/fraxen/tectonicplates)
* [GeoJSON Plate Boundaries](https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json)  


## Tasks  
* Stored all the API endpoints from the _data sources_ section  
* Used D3 to load all the GeoJSON data  
* Created a map using Leaflet plotting the earthquakes based on their longitude and latitude  
* The data markers' size and color were based on the magnitudes  
* Marker popups included additional information for the earthquake (Location, Date, and Magnitude)  
* Fault Line data was also visualized using Leaflet, and popups displayed the boudary name  
* A legend was included that allowed users to select from one base map, one time span, and a check box for fault lines to be on or off  


## Results  

### Below are links to the resulting maps. The last one, loading earthquake data for hour, day, week, and month, is currently slow loading.  

* [Past Week Only](https://code-sparrow.github.io/Interactive-Earthquake-Map/Leaflet-Level-1)  
* [Past Week with Fault Lines](https://code-sparrow.github.io/Interactive-Earthquake-Map/Leaflet-Level-2)  
* [Past Hour, Day, Week, or Month with Fault Lines](https://code-sparrow.github.io/Interactive-Earthquake-Map/Leaflet-Level-2b)  