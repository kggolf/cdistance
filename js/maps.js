/** We define variables and containers (caching); **/
var location1, location2, result;
var address1, address2;
var map, line;
var infowindow1, infowindow2;
var distance;

var mapCanvas = $('#map_canvas');
var noGeoContainer = $('#no_geo');
var myAddress = $('#my_address');
var locationFound = $('#location');
var locationHidden = $('#location_hidden');
var locationNotFound = $('#location_not_found');
var destination  = $('#destination');
var destination_input  = $('#destination_input');

var address1, address2;
var geocoder = new google.maps.Geocoder();

/** on document ready */
$(function(){

  /** Cookies for last Destinations **/
  initCookie();

  /** HTML5 Geolocalizator **/
  getCurrentLocation();

  /** Clear inputs on dbclick **/
  $('input').on('dblclick', function(){
    $(this).val('');
  });

  /** func for open hidden structures **/
  $('.door').click(function(event){
    event.preventDefault();
    $(this).next().slideToggle('fast');
    $(this).find('span').toggleClass('open');
    $(this).next().find('input').val('').focus();
  });

  /** Action for selecting the last destinations saved in cookies **/
  $('.search_address').live('click', function(){
    $('#destination_input').val($(this).html());
    setPosition(2, $(this).html());
  });

  /** if there is an error, it makes you look for a destination again **/
  $('#error_link').live('click', function(event){
    event.preventDefault();
    $(this).parent().slideUp('slow');
    $('#destination_input').val('').focus();
  });
});

/** Get Current location by HTML5 Geolocalizator **/
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        geoShowPosition,
        geoHandleError,
        {timeout: 5000, enableHighAccuracy: true}
    );
  }else{
    showErrors('This Browser doesn\'t use geolocalizator');
    showLocationInfo('Amsterdam', true);
  }
}

/**
 * If geolocalizator didn't work or wasn't allowed by the user.
 * @param err
 */
function geoHandleError(err) {
  noGeoContainer.show();
  showLocationInfo('Amsterdam', true);

  // We could Personalized messages for different cases
  if (err.code == 1) {
    messages = 'Geolocalization not accepted by the user';
  }
  if (err.code == 2) {
    messages = 'Share location wasn\'t allowed';
  }
  if (err.code == 3) {
    messages = 'Can\'t get current location';
  }
  if (err.code == 4) {
    messages = 'Not Recognized';
  }
  showErrors(messages);
}

/**
 * if Geolocalizator worked fine
 * 	- Set The Current Position
 * 	- Get the Address to show
 * @param position
 */
function geoShowPosition(position) {
  var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  getAddress(location, 1);
  noGeoContainer.slideUp('slow');
}

/**
 * GEOCODE to get Address
 * @param location
 * @param bool
 */
function getAddress(location, position){
  geocoder.geocode({'latLng': location}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        if(position == 2){
          destination_input.val(results[0].formatted_address);
          setAddressCookie(results[0].formatted_address);
        }else{
          showLocationInfo(results[0].formatted_address, position);
        }
        setPosition(position, results[0].formatted_address);
      } else {
        showErrors('No results found');
      }
    } else {
      showErrors('Geocoder failed due to: ' + status);
    }
  });
}

/**
 * Showing the Current Location
 * @param value
 * @param bool
 */
function showLocationInfo(value, bool){
  myAddress.html(value);
  locationHidden.val(value);
  locationFound.slideDown('slow');
  locationNotFound.hide();
  destination.slideDown('slow');
  if (bool) initializeMap();
}


/**
 * GEOCODE to get Lat and LNG by address
 * @param position
 * @param address
 */
function setPosition(position, address){

  // Finds the coordinates for the two locations and calls the showMap() function
  geocoder = new google.maps.Geocoder(); // creating a new geocode object

  geocoder.geocode( { 'address': address}, function(results, status){
    if (status == google.maps.GeocoderStatus.OK){
      result = results[0].geometry.location;

      if(position == 1){
        location1 = result;
      }else{
        location2 = result;
      }
      showMap();
    } else {
      showErrors("Geocode was not successful for the following reason111: " + status + address);
    }
  });
}

/** Initializing the Map **/
function initializeMap(){

  address1 = locationHidden.val();
  address2 = destination_input.val();
  // finding out the coordinates
  if (geocoder)
  {
    if(address1!=""){
      setPosition(1, address1);
      if(address2 != ""){
        setPosition(2, address2);
      }
    }else{
      showMap();
    }
  }
}

/** Showing the map **/
function showMap(){
  address1 = locationHidden.val();
  address2 = destination_input.val();

  if(location2 != undefined){
    // center of the map (computes the mean value between the two locations)
    center = new google.maps.LatLng((location1.lat()+location2.lat())/2,(location1.lng()+location2.lng())/2);
    zoom = 10;
  }else{
    zoom = 12;
    center = location1;
  }
  // creates and shows the map
  var mapOptions = {
      zoom: zoom,
      center: center,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI:true,
      disableDoubleClickZoom:true,
      navigationControl:true
  }

  var map = new google.maps.Map(mapCanvas.get(0), mapOptions);
  mapCanvas.slideDown('slow');

  //Default Icon as marker
  var marker = new google.maps.MarkerImage('images/marker.png');

  // create the markers for the two locations
  /** AUTOCOMPLETE Current Location **/
  var input = $("#keyword").get(0);
  var options = {
    componentRestrictions: {country: "nl"}
  };
  var autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.bindTo("bounds", map);

  google.maps.event.addListener(autocomplete, "place_changed", function(){
    var place = autocomplete.getPlace();

    if(location2 == undefined){
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(15);
      }
    }else{
      directionsDisplay.setMap(map);
      continueShowRoute(location1, location2);
    }

    //calls the function to show and set the new current Location
    marker1.setPosition(place.geometry.location);
    showLocationInfo(input.value, false);
    setPosition(1, input.value);
  });

  /** MARKER Current Location **/
  var marker1 = new google.maps.Marker({
    map: map,
    position: location1,
    title: "Your Current Position",
    icon: marker,
    draggable: true
  });

  google.maps.event.addListener(marker1, 'dragend', function() {
    location1 = marker1.getPosition();
    if(location2 != undefined){
      directionsDisplay.setMap(map);
      continueShowRoute(location1, location2);
    }
    getAddress(location1, 1);
  });

  //creates info boxes for the current location marker
  infowindow1 = new google.maps.InfoWindow({
    content: address1
  });

  // if location2 is defined
  if(location2 != undefined){

    /** MARKER Destination */
    var marker2 = new google.maps.Marker({
      map: map,
      position: location2,
      title: "Your Current Position",
      icon: marker,
      draggable: true
    });

    google.maps.event.addListener(marker2, 'click', function() {
      infowindow2.open(map, marker2);
    });

    //creates info boxes for the destination marker
    infowindow2 = new google.maps.InfoWindow({
      content: address2
    });

    google.maps.event.addListener(marker2, 'dragend', function() {
      location2 = marker2.getPosition();
      getAddress(location2, 2);
      directionsDisplay.setMap(map);
      continueShowRoute(location1, location2);
    });


    // initializes directions service
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      suppressInfoWindows: true
    });

    directionsDisplay.setMap(map);
    continueShowRoute(location1, location2);
  }

  /** AUTOCOMPLETE Destination **/
  var input2 = $("#destination_input").get(0);
  var autocomplete2 = new google.maps.places.Autocomplete(input2, options);
  google.maps.event.addListener(autocomplete2, "place_changed", function(){
    setPosition(2, input2.value);
    setAddressCookie(input2.value);
  });

  // adds action events so the info windows will be shown when the marker is clicked
  google.maps.event.addListener(marker1, 'click', function() {
    infowindow1.open(map,marker1);
  });
}

/**
 * Drawing the route in the map
 * @param location1
 * @param location2
 */
function continueShowRoute(location1, location2){
  // hides last line
  if (line){
    line.setMap(null);
  }

  // shows a line between the two points
  line = new google.maps.Polyline({
    map: map,
    path: [location1, location2],
    strokeWeight: 7,
    strokeOpacity: 0.8,
    strokeColor: "#FFAA00"
  });

  // computes distance between the two points
  var R = 6371;

  var dLat = toRad(location2.lat()-location1.lat());
  var dLon = toRad(location2.lng()-location1.lng());

  var dLat1 = toRad(location1.lat());
  var dLat2 = toRad(location2.lat());

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(dLat1) * Math.cos(dLat1) *
  Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;

  $('#distance_direct').html('<br/>The distance is: <b>'+d.toFixed(2)+' km</b>');

  // finds and shows route between the points
  var request = {
    origin:location1,
    destination:location2,
    travelMode: google.maps.DirectionsTravelMode.DRIVING
  };
  directionsService.route(request, function(response, status){
    if (status == google.maps.DirectionsStatus.OK){
      directionsDisplay.setDirections(response);
      distance = "Distance by Route: <b>"+response.routes[0].legs[0].distance.text+"</b>";
      distance += "<br/>The aproximative driving time is: <b>"+response.routes[0].legs[0].duration.text+"</b>";
      document.getElementById("distance_road").innerHTML = distance;
    }
    else{
      showErrors(status);
    }
  });

  // updates text in infowindows
  var text1 = address1;
  var text2 = address2;

  infowindow1.setContent(address1);
  infowindow2.setContent(address2);
}

function toRad(deg){
  return deg * Math.PI/180;
}

/**
 * Showing Errors - Notifications
 * @param message
 */
function showErrors(message){
  $('#no_geo').html(message).stop(true).slideDown('slow').delay(1500).fadeOut('slow');
}