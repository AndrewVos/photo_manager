/* globals $, mapboxgl, turf */

$(document).on('turbolinks:load', function () {
  var $map = $('#map')
  if ($map.length === 0) {
    return
  }

  var $mapImages = $('.map-container .map-images')
  $mapImages.on('scroll', function () {
    showOnlyVisibleImages()
  })

  var markerIcon = $map.data('marker-icon')
  mapboxgl.accessToken = $map.data('access-token')

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
  })
  map.on('moveend', showImages)

  var groups = []

  $.getJSON('/photos/map/locations', function (data) {
    groups = buildGroups(data)
    for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      var group = groups[groupIndex]

      var $marker = $('<div>')
      $marker.css('background-image', 'url(' + markerIcon + ')')
      $marker.css('width', '39px')
      $marker.css('height', '46px')

      new mapboxgl.Marker($marker[0], { offset: [-14, -43] })
        .setLngLat([group.longitude, group.latitude])
        .addTo(map)
    }

    showImages()
  })

  function buildGroups (locations) {
    var groups = []

    for (var locationIndex = 0; locationIndex < locations.length; locationIndex++) {
      var location = locations[locationIndex]

      var addedToGroup = false
      for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        var group = groups[groupIndex]

        var line = {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': [
              [location.longitude, location.latitude],
              [group.longitude, group.latitude]
            ]
          }
        }

        var distance = turf.lineDistance(line, 'metres')
        if (distance < 10) {
          addedToGroup = true
          group.locations.push(location)
          break
        }
      }

      if (!addedToGroup) {
        groups.push(
          {
            longitude: location.longitude,
            latitude: location.latitude,
            locations: [location]
          }
        )
      }
    }
    return groups
  }

  function showImages () {
    $mapImages.empty()

    var bounds = map.getBounds()

    for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      var group = groups[groupIndex]

      var pt = turf.point([group.longitude, group.latitude])

      var features = turf.featureCollection([
        turf.point([bounds.getNorthEast().lng, bounds.getNorthEast().lat]),
        turf.point([bounds.getSouthWest().lng, bounds.getSouthWest().lat])
      ])
      var bbox = turf.bbox(features)
      var bboxPolygon = turf.bboxPolygon(bbox)
      var inside = turf.inside(pt, bboxPolygon)

      if (inside) {
        for (var locationIndex = 0; locationIndex < group.locations.length; locationIndex++) {
          var location = group.locations[locationIndex]

          var $mapImage = $('<div class="img-responsive map-image"><a href="' + location.original + '"><img data-src="' + location.thumbnail + '"></a></div>')
          $mapImages.append($mapImage)
        }
      }
    }

    showOnlyVisibleImages()
  }

  function showOnlyVisibleImages () {
    $mapImages.find('.map-image img').each(function () {
      var $img = $(this)

      if ($img.data('src') && $img.visible()) {
        $img.attr('src', $img.data('src'))
      }
    })
  }
})
