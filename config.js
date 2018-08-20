const CONFIG = {
    UNITS:[
        { "id": 1, "name": "Unge 1", "png": "eagle_head_1.svg"},
        { "id": 2, "name": "Unge 2", "png": "eagle_head_2.svg"}
    ],
    IS_DEMO: true,
    DEMO_DATE: "20180814",
    WMS_URL: "http://geoserver:8080/geoserver/wms",
    WFS_URL: "http://geoserver:8080/geoserver/demo/ows",
    TICKETSERVICEURL: "http://localhost:8170/geo/ticket",
    MAP_PROJECTION: "EPSG:3857",
    FEATURETYPE: "gps_oern",
    MAP_CENTER_LONLAT: [11.364, 56.204],
    ZOOM_DEFAULT: 12,
    MAP_CSS: "./dofmap.css",
    DAYS_DIFF: -1,
    DAYS_INTERVAL: -7,
    DELAY_DEFAULT: 500, //animation
    TIME_SLOTS_PER_HOUR: 4,
    HOURS_BEFORE_AFTER_SUNSET: -1
}

export { CONFIG };
