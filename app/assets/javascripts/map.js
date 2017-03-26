function initialiseMap() {
  var $map = $('.js-map')

  var map;
  map = new google.maps.Map($map[0], {
    zoom: 3,
    center: new google.maps.LatLng(0, 0),
    mapTypeId: 'roadmap'
  });

  function addMarker(position) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(position.latitude, position.longitude),
      map: map
    })
    google.maps.event.addListener(marker, 'click', function() {
      console.log('clicked')
    })
  }

  var positions = $map.data('markers')

  for (var i = 0; i < positions.length; i++) {
    addMarker(positions[i]);
  }
}
