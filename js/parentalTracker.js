var map;            // The map

$(document).ready(function () {
    // ******* Map initialisation ******
    function initialise() {
        var mapOptions = {
            zoom: 1,
            scrollwheel: false,
            navigationControl: false,
            mapTypeControl: false,
            scaleControl: false,
            draggable: false,
            disableDefaultUI: true,
            center: new google.maps.LatLng(-41.3, 174.783),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        geocoder = new google.maps.Geocoder();
        bounds = new google.maps.LatLngBounds();
    }

    google.maps.event.addDomListener(window, 'load', initialise);
});