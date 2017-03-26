$(document).on('turbolinks:load', function () {
  var $map = $('#map')
  if ($map.length == 0) {
    return
  }
  var markerImage = $map.data('marker-icon')
  var accessToken = $map.data('access-token')
  var locations = $map.data('markers')

  mapboxgl.accessToken = accessToken

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
  })

  for (var i = 0; i < locations.length; i++) {
    var $marker = $('<div>')
    $marker.css('background-image', 'url(' + markerImage + ')')
    $marker.css('width', '39px')
    $marker.css('height', '46px')

    var marker = new mapboxgl.Marker($marker[0], { offset: [-14, -43] })
      .setLngLat([locations[i].longitude, locations[i].latitude])
      .addTo(map)
  }
})
