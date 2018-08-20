//units config
const UNIT1 = { "id": 1, "name": "Unge 1", "png": "eagle_head_1.svg" };
const UNIT2 = { "id": 2, "name": "Unge 2", "png": "eagle_head_2.svg" };

//var units = [UNIT1,UNIT2]; //more units can be added
//alternativ hvis kun 1 gps: 
var units = [UNIT1,UNIT2];

const IS_DEMO = true;
const DEMO_DATE = "20180814";

//map config
const WMS_URL = "http://geoserver:8080/geoserver/wms"; //service for showing background layer of gps observations
const WFS_URL = "http://geoserver:8080/geoserver/demo/ows"; //service for getting recent gps observations
const TICKETSERVICEURL = "http://localhost:8170/geo/ticket";  //need DOF's Java Service to get a ticket from Kortforsyningen
const MAP_PROJECTION = "EPSG:3857";
const FEATURETYPE = "gps_oern"; //layer name for services   

const MAP_CENTER_LONLAT = [11.364, 56.204]; //center coordinates
const ZOOM_DEFAULT = 12;
const MAP_CSS = "./dofmap.css"

//data limitation
const DAYS_DIFF = -1;
const DAYS_INTERVAL = -7;

//animation
const DELAY_DEFAULT = 500;
const TIME_SLOTS_PER_HOUR = 4;
const HOURS_BEFORE_AFTER_SUNSET = 0;
