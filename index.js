import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Style, Circle, Fill, Stroke} from 'ol/Style.js';
import {ScaleLine} from 'ol/control/ScaleLine.js';
import {transform } from 'ol/proj.js';
import Tile from 'ol/Tile.js';
import TileWMS from 'ol/source/TileWMS.js';
import VectorLayer from 'ol/layer/Vector.js';
import Vector from 'ol/source/Vector.js';
// import CONFIG from './config.js';
import {DOFMAPLAYERS, applyTicket} from './layers.js';
import {LayerSwitcher} from './LayerSwitcher.js';
import "./LayerSwitcher.js";
import moment from 'moment';
import GeoJSON from 'ol/FORMAT/GeoJSON';
import "./import-jquery";
import "jquery-ui-dist/jquery-ui.js";

let CONFIG = {
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

//var units = [UNIT1,UNIT2]; //more units can be added
//alternativ hvis kun 1 gps: 
var units = CONFIG.UNITS;
const TIME_SLOTS_PER_HOUR = CONFIG.TIME_SLOTS_PER_HOUR;
const TIME_SLOTS = 24 * CONFIG.TIME_SLOTS_PER_HOUR;
//get the local timezone as GMT +0?:00
const TIMEZONE_OFFSET_HOURS = new Date().getTimezoneOffset() / -60;

/* global variables */

var features = []; //the ol.Feature's to be rendered
var numAnimations = 1; //set to number of initially checked checkboxes. if equals 1 then animation pan to the position on every feature rendering
var today = (CONFIG.IS_DEMO)? new moment(CONFIG.DEMO_DATE) : moment().add(CONFIG.DAYS_DIFF, 'days');
var timelabel = "0" + TIMEZONE_OFFSET_HOURS + ":00";
var startTime, endTime;
var startPos = 0;
var endPos = TIME_SLOTS;
var slotId;
var timer = null;
/* read feature */
var formatter = new GeoJSON();

var map = null;

/* style function for each fetched feature */
var getStyle = function (feature, resolution) {
    if (feature.get('unit_id') == units[0].id) {
        return [new Style({
            image: new Circle({
                fill: new Fill({ color: 'rgba(0, 255, 255, 0.6)' }),
                stroke: new Stroke({ color: 'rgb(0,255,255)', width: 2 }),
                radius: 10
            })
        })];
    }
    else {
        return [new Style({
            image: new Circle({
                fill: new Fill({ color: 'rgba(255, 0, 0, 0.6)' }),
                stroke: new Stroke({ color: 'rgb(255,0,0)', width: 2 }),
                radius: 10
            })
        })];
    }
};

var initMap = function (layers) {       /* OpenLayers 4 map */
    map = new Map({
        target: 'map_canvas',
        layers: layers,
        // controls: ol.control.defaults().extend([
        //     new ScaleLine()
        // ]),
        view: new View({
            projection: CONFIG.MAP_PROJECTION,
            center: transform(CONFIG.MAP_CENTER_LONLAT, 'EPSG:4326', CONFIG.MAP_PROJECTION),
            zoom: 7
        })
    });

    for(var i=0;i<units.length;i++){
        map.addLayer(new Tile({
            name: units[i].name,
            baselayer: false,
            visible: true,               
            source: new TileWMS({              
                url: CONFIG.WMS_URL,
                params: {
                    LAYERS: CONFIG.FEATURETYPE,
                    SRS: CONFIG.MAP_PROJECTION,
                    FORMAT: 'image/png',
                    TILED: false,
                    CQL_FILTER: "(unit_id=" + units[i].id + " AND gps_date>" + moment().add((CONFIG.DAYS_DIFF + CONFIG.DAYS_INTERVAL), 'days').format('YYYY-MM-DD') + ")" //start from now plus a negative number of days
                }
            })        
        }));
    }
};

var compare = function (a, b) {
    if (a.properties.gps_time < b.properties.gps_time)
        return -1;
    if (a.properties.gps_time > b.properties.gps_time)
        return 1;
    return 0;
};

var initUnits = function () {
    var unitbox = $('#units');
    for (var i = 0; i < units.length; i++) {
        var forMapObject = {
            data: new Array(TIME_SLOTS),
            overlay: new VectorLayer({
                map: map,
                source: new Vector(),
                style: getStyle
            })
        };
        $.extend(units[i], forMapObject);
        unitbox.append('<label class="checkbox-inline"><input class="checkbox" type="checkbox"' + (i==0 ? ' checked ' : '') + '><span>' + units[i].name +'</span></label>');
        getTodaysPosition(i);  
    }
    $('.checkbox').click(function () {
        numAnimations = $('.checkbox:checked').length;
    })
}

var renderPosition = function (id, idx, delay) {

    //data for the unit
    var arr = units[id].data;
    var overlay = units[id].overlay;
    if (typeof arr[idx] != "undefined" && arr[idx] != null) {
        var f = formatter.readFeature(arr[idx]);
        //replace the feature fot the unit
        features[id] = f;
        overlay.getSource().clear();
        overlay.getSource().addFeature(f);
        f.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                src: units[id].png
            })
        }));
        if (numAnimations == 1) {
            //we only follow one track in the animation process
            map.getView().animate({ zoom: map.getView().getZoom(), center: f.getGeometry().getCoordinates(), duration: delay / 2 });
        }
    }
};

var zoomToPositionForTime = function (time) {
    likeTime = time.format('HH');
    var d = today.subtract(1, 'days').format('YYYY-MM-DD');
    return $.ajax({
        url: CONFIG.WFS_URL,
        data: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            outputformat: 'application/json',
            maxfeatures: '8',
            typeName: CONFIG.FEATURETYPE,
            srsName: CONFIG.MAP_PROJECTION,
            CQL_FILTER: '(gps_date=' + d + ' AND gps_time LIKE \''+ likeTime + '%\')' // at night
        },

        success: function (data) {
            var arr = data.features;
            if (arr.length >= 2) {
                var boundingExtent = new Array(arr.length);
                for(var i=0;i<arr.length;i++){
                    boundingExtent[i] = formatter.readFeature(arr[i]).getGeometry().getCoordinates();
                }
                //set extent for the two features all-together
                var ext = ol.extent.boundingExtent(boundingExtent);
                var v = map.getView();
                v.fit(ext, { minResolution: 1.0, size: map.getSize() });
                //zoom out if very narrow fit
                if(v.getZoom()>13) v.setZoom(13);
            }
        },

        error: restError
    });
};

var getTodaysPosition = function (id) {
    var unitId = units[id].id;
    //add negative number of days
    var d = today.format('YYYY-MM-DD');
    return $.ajax({
        url: CONFIG.WFS_URL,
        data: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            outputformat: 'application/json',
            maxfeatures: '100',
            typeName: CONFIG.FEATURETYPE,
            srsName: 'EPSG:3857',
            CQL_FILTER: '(unit_id=' + unitId + ' AND gps_date=' + d + ')'
        },

        success: function (data) {
            var featureArr = units[id].data;
            var arr = data.features;
            if (arr.length > 0) {
                arr.sort(compare);
            }
            for (var i = 0; i < arr.length; i++) {
                var t = arr[i].properties.gps_time;
                var idx = getPosFromTimeString(t);
                featureArr[idx] = arr[i];
            }
        },

        error: restError
    });

};


/**
 * reset SliderAndTimer
 * @param: reset, if the slider shall return to start position (when hits the end)
 * */
var resetSliderAndTimer = function(reset){

    clearInterval(timer);
    $('#animate').show();
    $('#animatestop').hide();
    if(reset) {
        timelabel = startTime.clone().add(TIMEZONE_OFFSET_HOURS, 'hours').format("HH:mm");
        $("#time").html(timelabel);
        slotId = startPos;
        $("#slidetime").slider("option", "value", slotId);
    }
};

var resetMap = function(){
    for(var i = 0; i<units.length;i++){
        units[i].overlay.getSource().clear();
    }
}

/**
 * start Slider and Timer and render corresponding positions
 * @param {HTMLElement} button : not used
 */
var startSliderAndTimer = function(button){
    var delay = CONFIG.DELAY_DEFAULT;

    timer = setInterval(function () {
        slotId++;
        timelabel = getTimeStringFromPos(slotId);
        $("#time").html(timelabel);
        var chb = $('.checkbox');
        for (var i = 0; i < units.length; i++) {
            if ($(chb[i]).is(":checked")) {
                renderPosition(i, slotId, delay);
            }
        }
        $("#slidetime").slider("option", "value", slotId);
        //stop condition
        if(slotId == endPos){
            resetSliderAndTimer(false);            
        }
        //end condition
        if (slotId >= TIME_SLOTS) {
            resetSliderAndTimer(true);
        }

    }, delay);

    $(button).hide();

    //stop animation
    $("#animatestop").show().click(function (event) {
        resetSliderAndTimer(false);
    });            
};


var getSunData = function(){
     var data={
        lat: CONFIG.MAP_CENTER_LONLAT[1],
        lng: CONFIG.MAP_CENTER_LONLAT[0],
        date : today.format("YYYY-MM-DD")
     };
    $.ajax({
        url: 'https://api.sunrise-sunset.org/json?callback=?',
        data : data,
        type: "GET",
        dataType: "jsonp",
        jsonpCallback: "getSunCallback"
    });

}; 

 var getSunCallback = function(json) {
    if (!json.Error && json.status == "OK") {
        var result = json.results;
        var sunrise = moment(result.sunrise, ["h:mm A"]);
        var sunset = moment(result.sunset, ["h:mm A"]);
        $('#sunrise').html(sunrise.clone().add(TIMEZONE_OFFSET_HOURS, 'hours').format("HH:mm"));
        $('#sunset').html(sunset.clone().add(TIMEZONE_OFFSET_HOURS, 'hours').format("HH:mm"));           
        startTime = sunrise.subtract(HOURS_BEFORE_AFTER_SUNSET, 'hours');
        endTime = sunset.add(HOURS_BEFORE_AFTER_SUNSET, 'hours');
        $("#time").html(startTime.clone().add(TIMEZONE_OFFSET_HOURS, 'hours').format("HH:mm"));
        startPos = getPosFromTimeString(startTime.format("HH:mm"));
        $("#slidetime").slider("option", "value", slotId);
        endPos = getPosFromTimeString(endTime.format("HH:mm"));
        zoomToPositionForTime(sunset);
    }
    else {
        $('#info').html(json.Message).show();
        startPos = 0;
    }
    slotId = startPos;
};

/* helper functions */
var restError = function (jqXHR, exception) {
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'No connection to service.\n Verify Network.';
    } else if (jqXHR.status == 404) {
        msg = 'Requested page not found. [404]';
    } else if (jqXHR.status == 500) {
        msg = 'Internal Server Error [500].';
    } else if (exception === 'parsererror') {
        msg = 'Requested JSON parse failed.';
    } else if (exception === 'timeout') {
        msg = 'Time out error.';
    } else if (exception === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    if (console.log)
        console.log("error", msg);
    $('#info').show().html(msg);
};

/**
 * prefix single-digit number with a zero 
 * */
var pad = function(n) {
    return (n < 10) ? ("0" + n) : n;
};

/**
 * 04:15 -> 4*4 (number of timeslots per hour) + 1
 * @param {String} t
 * @return {int}: 17
 */
var getPosFromTimeString = function(t){
    return parseInt(t.substr(0, 2)) * TIME_SLOTS_PER_HOUR + Math.ceil(parseInt(t.substr(3, 2)) / (60 / TIME_SLOTS_PER_HOUR));
};

/**
 * 17 - > 04:15
 * @param {int} pos 
 */
var getTimeStringFromPos = function(pos){
        var h = Math.floor((pos) / TIME_SLOTS_PER_HOUR);
        if (h + TIMEZONE_OFFSET_HOURS >= 24) h = h - 24;
        var m = (pos % TIME_SLOTS_PER_HOUR) * (60 / TIME_SLOTS_PER_HOUR);
        return pad(h + TIMEZONE_OFFSET_HOURS) + ":" + pad(m);
}

/**
 * Initialize on document ready
 */
$(document).ready(function () {

    $('#today').html(today.format("[d. ] DD/MM/YYYY"));

    $("#slidetime").slider({
        min: 0,
        max: TIME_SLOTS,
        change: function (event, ui) {
            if (event.originalEvent) {
                slotId = ui.value;
                resetMap();
                timelabel = getTimeStringFromPos(slotId);
                $("#time").html(timelabel);
            }
        }
    });        

    //async call to service followed by applying ticket and initiating map, map controls and vector layers  
    $.when($.ajax({dataType:"json", url: CONFIG.TICKETSERVICEURL})).then(function( data, textStatus, jqXHR ) {
            var layers = DOFMAPLAYERS;
            applyTicket(layers, data.ticket);
            initMap(layers);
            getSunData();
            initUnits();
            var layerSwitcher = new LayerSwitcher({map : map, div_baselayers: "baseLayers", div_overlays: "overlayLayers", cssPath: CONFIG.MAP_CSS});
            map.updateSize(); 
    });

    $('#animate').click(function (event) {
        startSliderAndTimer(this);
    });



});

