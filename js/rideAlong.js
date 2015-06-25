var map;            // The map
var watcher;        // Watches for changes in geolocation

var markers = [];   // The markers which are currently drawn on the map
var USER_INDEX = 0; // The position of the four markers which are drawn on the map
var DEST_INDEX = 1;
var USER_STOP_INDEX = 2;
var DEST_STOP_INDEX = 3;

// Users most up to date location and their destination location
var locations = {
    userLat: 0,
    userLng: 0,
    destLat: 0,
    destLng: 0
};

$(document).ready(function () {
    
    /** 
     * Watches the users location
     */
    function updateLocation() {
        if (navigator.geolocation) {
            watcher = navigator.geolocation.watchPosition(
                usePosition,
                noGeolocation,
                { maximumAge: 500000, enableHighAccuracy: true, timeout: 6000 }
            );
        } else {
            noGeolocation(false);
        }
    }
    
    /**
     * Centres map on users location once the map is created
     */
    function usePosition(pos) {
        locations.userLat = pos.coords.latitude;
        locations.userLng = pos.coords.longitude;
        
        drawMarker(locations.userLat, locations.userLng, USER_INDEX);
    }

    /**
     * What to do if geolocation isn't available
     */
    function noGeolocation(geoError) {
        var errors = {
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        };
        
        if (geoError) {
            alert("Geolocation service failed: "  +errors[geoError.code]);
        } else {
            alert("Browser/device doesn't support geolocation");
        }
        addInputLocation();
    }

    /**
     * Draws the given route number's path onto the map
     */
    function drawPath(routeNumber) {
        var url = "https://ready-set-go.herokuapp.com/path/" + routeNumber;
        console.log('Drawing route #' + routeNumber);
        $.get(url, function (rawPath) {

            var pathData = [];

            removePath();

            // Get route information & iterate over into array
            for (var i = 0; i < rawPath.length; i++){
                pathData[i] = new google.maps.LatLng(rawPath[i].shape_pt_lat, rawPath[i].shape_pt_lon);
                busPath = new google.maps.Polyline({
                    path: pathData 
                });
            }
            busPath.setMap(map);
        }, 'json');
    }  
    
    
    /**
     * Removes the currently drawn path from map
     */
    function removePath() {
        if(typeof busPath !== 'undefined'){
            busPath.setMap(null);
        };
    }
        
    /**
     * draws a marker at the given point and adds it to the marker array
     */
    function drawMarker(lat, lng, index) {
        var markerIcon;
        
        switch (index) {
            case 0:
                markerIcon = "../images/me.png";
                break;
            case 1:
                markerIcon = "../images/Destination.png";
                break;
            case 2:
                markerIcon = "../images/stopA.png";
                break;
            case 3:
                markerIcon = "../images/stopB.png";
                break;
            default:
                console.log("Incorrect index for marker icon: " + index);
                break;
        }
        
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map,
            icon: markerIcon

//            title: 'Hello World!'
        });

        if (typeof markers[index] !== 'undefined'){
            markers[index].setMap(null);
        }
        
        markers[index] = marker;
        mapBounds();
    }

    /**
     * Ensures that everything on the map is actually on the map, changes zoom levels as appropriate
     */
    function mapBounds() {        
        map.setCenter(new google.maps.LatLng(locations.userLat, locations.userLng));

    }

    // ******* Map initialisation ******
    function initialise() {
        var mapOptions = {
            zoom: 16,
//            scrollwheel: false,
//            navigationControl: false,
//            mapTypeControl: false,
//            scaleControl: false,
//            draggable: false,
            disableDefaultUI: true,
            center: new google.maps.LatLng(-41.3, 174.783),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        geocoder = new google.maps.Geocoder();
        bounds = new google.maps.LatLngBounds();
    }

    google.maps.event.addDomListener(window, 'load', initialise);
    updateLocation();
});