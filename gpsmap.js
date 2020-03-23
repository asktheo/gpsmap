const TIME_SLOTS = 24 * TIME_SLOTS_PER_HOUR;
//get the local timezone as GMT +0?:00
const TIMEZONE_OFFSET_HOURS = (IS_DEMO)? new Date(DEMO_DATE).getTimezoneOffset() / -60 : new Date().getTimezoneOffset() / -60;

/* global variables */

var features = []; //the ol.Feature's to be rendered
var numAnimations = 1; //set to number of initially checked checkboxes. if equals 1 then animation pan to the position on every feature rendering
var today = (IS_DEMO)? new moment(new Date(DEMO_DATE)) : moment().add(DAYS_DIFF, 'days');
var timelabel = "0" + TIMEZONE_OFFSET_HOURS + ":00";
var startTime, endTime;
var startPos = 0;
var endPos = TIME_SLOTS;
var slotId;
var timer = null;
/* read feature */
var formatter = new ol.format.GeoJSON();

/* style function for each fetched feature */
var getStyle = function (feature, resolution) {
    if (feature.get('unit_id') == UNIT1.id) {
        return [new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({ color: 'rgba(0, 255, 255, 0.6)' }),
                stroke: new ol.style.Stroke({ color: 'rgb(0,255,255)', width: 2 }),
                radius: 10
            })
        })];
    }
    else {
        return [new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({ color: 'rgba(255, 0, 0, 0.6)' }),
                stroke: new ol.style.Stroke({ color: 'rgb(255,0,0)', width: 2 }),
                radius: 10
            })
        })];
    }
};

var initMap = function (layers) {       /* OpenLayers 4 map */
    map = new ol.Map({
        target: 'map_canvas',
        layers: layers,
        controls: ol.control.defaults().extend([
            new ol.control.ScaleLine()
        ]),
        view: new ol.View({
            projection: MAP_PROJECTION,
            center: ol.proj.transform(MAP_CENTER_LONLAT, 'EPSG:4326', MAP_PROJECTION),
            zoom: 7
        })
    });

    for(var i=0;i<units.length;i++){
        map.addLayer(new ol.layer.Tile({
            name: units[i].name,
            baselayer: false,
            visible: true,               
            source: new ol.source.TileWMS({              
                url: WMS_URL,
                params: {
                    LAYERS: FEATURETYPE,
                    SRS: MAP_PROJECTION,
                    FORMAT: 'image/png',
                    TILED: false,
                    CQL_FILTER: "(unit_id=" + units[i].id + " AND gps_date>" + today.clone().add((DAYS_DIFF + DAYS_INTERVAL), 'days').format('YYYY-MM-DD') + ")" //start from now plus a negative number of days
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
            overlay: new ol.layer.Vector({
                map: map,
                source: new ol.source.Vector(),
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
    var d = today.clone().subtract(1, 'days').format('YYYY-MM-DD');
    return $.ajax({
        url: WFS_URL,
        data: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            outputformat: 'application/json',
            maxfeatures: '8',
            typeName: FEATURETYPE,
            srsName: MAP_PROJECTION,
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
        url: WFS_URL,
        data: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            outputformat: 'application/json',
            maxfeatures: '100',
            typeName: FEATURETYPE,
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
    var delay = DELAY_DEFAULT;

    timer = setInterval(function () {
        slotId++;
        timelabel = getTimeStringFromPos(slotId);
        $("#time").html(timelabel);
        var chb = $('.checkbox');
        for (i = 0; i < units.length; i++) {
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
        lat: MAP_CENTER_LONLAT[1],
        lng: MAP_CENTER_LONLAT[0],
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
    $.when($.ajax({dataType:"json", url: TICKETSERVICEURL})).then(function( data, textStatus, jqXHR ) {
            var layers = DOFMAPLAYERS;
            applyTicket(layers, data.ticket);
            initMap(layers);
            getSunData();
            initUnits();
            var layerSwitcher = new LayerSwitcher({map : map, div_baselayers: "baseLayers", div_overlays: "overlayLayers", cssPath: MAP_CSS});
            map.updateSize(); 
    });

    $('#animate').click(function (event) {
        startSliderAndTimer(this);
    });



});

