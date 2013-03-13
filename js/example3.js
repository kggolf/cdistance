$(function(){
  $('.search_submit').live('click', function(){
    showLocation();
  });
})
var container=$('#demo');
var currentLat='';
var currentLong='';
getLocation();
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);

  } else {
    container.html("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  currentLat = position.coords.latitude;
  currentLong = position.coords.longitude;
  alert('currentLat: '+currentLat + ' currentLong: ' + currentLong);
  var latlon=position.coords.latitude+","+position.coords.longitude;

  var img_url="http://maps.googleapis.com/maps/api/staticmap?center="
    +latlon+"&zoom=14&size=400x300&sensor=false";

  document.getElementById("map").innerHTML="<img src='"+img_url+"'>";
}
var geocoder, location1, location2;

geocoder = new google.maps.Geocoder();
function showLocation() {
  address1 = $('#address1').val();
  address2 = $('#address2').val();
  geocoder.getLocations(
      address1,
      function(response) {
        if (!response || response.Status.code != 200) {
          alert("Sorry, we were unable to geocode the first address");
        } else {
          location1 = {
                lat : currentLat,
                lon : currentLong
//                lat : response.Placemark[0].Point.coordinates[1],
//                lon : response.Placemark[0].Point.coordinates[0],
//              address : response.Placemark[0].address
          };
          geocoder
          .getLocations(
              address2,
              function(response) {
                if (!response
                    || response.Status.code != 200) {
                  alert("Sorry, we were unable to geocode the second address");
                } else {
                  location2 = {
                      lat : response.Placemark[0].Point.coordinates[1],
                      lon : response.Placemark[0].Point.coordinates[0],
                      address : response.Placemark[0].address
                  };
                  //alert(response.Placemark[0].Point.coordinates[1]);
                  calculateDistance(address1, address2);
                }
              });
        }
      });
}

function calculateDistance(address1, address2) {

  var map = new GMap2(document.getElementById("map"));
  var directions = new GDirections(map);
  //alert(directions);

  directions.load("from: " + address1
      + " to: " + address2);

  GEvent.addListener(directions, "load", function() {

    // Display the distance from the GDirections.getDistance() method:
    $('#distance').html(directions
    .getDistance().meters
    + " meters");

    // Display the duration from the GDirections.getDuration() method:
    $('#duration').html(directions
    .getDuration().seconds
    + " seconds");
  });

}