// TODO Add loaders
// TODO Dynamic stop info how long until the next bus
// TODO Map styling - remove locations only core roads
// TODO remove route buttons once path drawing is working

// Users most up to date location and their destination location
var locations = {
    userLat: 0,
    userLng: 0,
    destLat: 0,
    destLng: 0
};

var watcher;        // Watches for changes in geolocation
var busPath;        // The current bus path drawn on the map

var map;            // The map
var geocoder;       // Used for geocoding the address
var bounds;         // Used for calculating the area of the map

var markers = [];   // The markers which are currently drawn on the map
var USER_INDEX = 0; // The position of the four markers which are drawn on the map
var DEST_INDEX = 1;
var USER_STOP_INDEX = 2;
var DEST_STOP_INDEX = 3;

$(document).ready(function () {
    // Helper function to deal with button events.
    $("button").click(function (event) {
        switch (event.target.id) {
        case "search":
            search();
            break;
        case "b11":
            drawPath(11);
            break;
        case "b17":
            drawPath(17);
            break;
        case "b42":
            drawPath(42);
            break;
        case "b52":
            drawPath(52);
            break;
        case "b57":
            drawPath(57);
            break;
        default:
            alert("No button ID found for: " + event.target.id);
        }
    });
    
    $("#location-input").on('click', "#useFromLocation", function(event){
        codeUserAddress();
    });

    /**
     * Searches for the suitable bus stop to get on and off at
     */
    function search() {
        // TODO Checks to make sure input is valid
                                
        var destination = document.getElementById("destination").value;
        
        showLoader();
        
        codeAddress(destination, function (result) {
            // TODO Check that result is valid
            locations.destLat = result.A;
            locations.destLng = result.F;
            drawMarker(locations.destLat, locations.destLng, DEST_INDEX);
            
            var url = "https://ready-set-go.herokuapp.com/search/"+JSON.stringify(locations);
            $.get(url, locations, function (res) {
                hideLoader();
                drawPath(res.routeNumber);
                drawMarker(res.destStopLat, res.destStopLng, DEST_STOP_INDEX);
                drawMarker(res.userStopLat, res.userStopLng, USER_STOP_INDEX);
                updateStopInfo(res.userStop, res.routeNumber);

                mapBounds();
                
            }, 'json');
        });
    }
    
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
     *
     */
    function codeUserAddress(){
        showLoader();
        var userAddress = document.getElementById("userLocation").value;
        
        codeAddress(userAddress, function (result) {
            hideLoader();
            locations.userLat = result.A;
            locations.userLng = result.F;
            
            drawMarker(locations.userLat, locations.userLng, USER_INDEX);            
            mapBounds();
        });
    }
    
    /**
     * Ensures that everything on the map is actually on the map, changes zoom levels as appropriate
     */
    function mapBounds() {
        bounds = new google.maps.LatLngBounds()
        for (var i = 0; i < markers.length; i++) {
            if(typeof markers[i] !== 'undefined') {                
                bounds.extend(new google.maps.LatLng(markers[i].getPosition().lat(), markers[i].getPosition().lng()));
            }
        }
        
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
        map.setZoom(map.getZoom());
        
        if(map.getZoom() > 14){
            map.setZoom(14);
        }
    }
    
    /**
     * Centres map on users location once the map is created
     */
    function usePosition(pos) {
        locations.userLat = pos.coords.latitude;
        locations.userLng = pos.coords.longitude;
        
        drawMarker(locations.userLat, locations.userLng, USER_INDEX);
        mapBounds();
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
     * Adds the dialogue box for a user to enter their position when geolocation isn't available
     */
    function addInputLocation() {
        if (document.getElementById("from-input") === null){
            var fromInput = document.createElement("div");
            fromInput.setAttribute("id", "from-input");
            fromInput.setAttribute("class", "input-group");
            fromInput.innerHTML = '<input type="text" id="userLocation" class="form-control" placeholder="Where are you?"><span class="input-group-btn"><button class="btn btn-default" id="useFromLocation" type="button">Use this location</button></span>';
            $("#location-input").prepend(fromInput);
        }
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
     * Updates the title and stop info where the user needs to get on the bus
     */
    function updateStopInfo(stopID, routeNumber) {
        var url = "https://ready-set-go.herokuapp.com/stopallinfo/"+stopID;
        console.log(url);
        $.get(url, function (res) {
            console.log(res[0]);
            $('#stopInfoH1').html(res[0].stop_name);
            $('#stopInfoP').html(res[0].stop_desc + ' Catching bus number ' + routeNumber);
        }, 'json');
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
    }

    /** 
     * Turns the inputAddress into a geolocation
     * inputid is the users entered string
     */
    function codeAddress(inputAddress, callback) {
        // TODO Create a better dialogue box for failure
        // TODO Fail if location is too far away, try another result?
        
        inputAddress = inputAddress + ', Wellington, New Zealand';
        geocoder.geocode( { 'address': inputAddress}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log(results);
                callback( results[0].geometry.location);
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }

    // ******* Map initialisation ******
    function initialise() {
        var mapOptions = {
            zoom: 14,
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