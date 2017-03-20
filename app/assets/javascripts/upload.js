/* globals $, EXIF, XMLHttpRequest, XDomainRequest, Blob, FileReader, Image */

$(document).on('click', '.js-upload', function () {
  $('.js-file-upload').click()
})

$(document).on('change', '.js-file-upload', function () {
  var input = this

  uploadPhoto(0, input)
})

function createCORSRequest (method, url) {
  var xhr = new XMLHttpRequest()
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true)
  } else if (typeof XDomainRequest !== 'undefined') {
    xhr = new XDomainRequest()
    xhr.open(method, url)
  } else {
    xhr = null
  }
  return xhr
}

function uploadPhoto (index, input) {
  if (index === input.files.length) {
    return
  }

  var file = input.files[index]

  EXIF.getData(file, function () {
    var data = this
    var metadata = EXIF.getAllTags(data)

    var $metadata = $('.js-image-metadata')
    $metadata.empty()
    for (var key in metadata) {
      $metadata.append($('<div>' + key + ': ' + metadata[key] + '</div>'))
    }

    var reader = new FileReader()
    reader.onload = function (e) {
      var image = new Image()
      image.src = e.target.result

      $('.js-image').empty()
      var $canvas = $('<canvas>')
      $('.js-image').append($canvas)

      var canvas = $canvas[0]
      var context = canvas.getContext('2d')

      var ratio = Math.min(500 / image.width, 500 / image.height)
      canvas.width = image.width * ratio
      canvas.height = image.height * ratio

      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      $.getJSON('/signed_url?content_type=' + encodeURIComponent(file.type), function (data) {
        uploadFile(data.original_name, data.original_url, file.type, file, function () {
          var thumbnail = dataURLtoBlob(canvas.toDataURL('image/png'))
          uploadFile(data.thumbnail_name, data.thumbnail_url, file.type, thumbnail, function () {
            uploadPhoto(index + 1, input)
            image = null
          })
        })
      })
    }

    reader.readAsDataURL(file)
  })
}

function uploadFile (url, contentType, content, callback) {
  var xhr = createCORSRequest('PUT', url)
  xhr.onload = function () {
    if (xhr.status === 200) {
      console.log('uploaded!')
      callback()
    } else {
      console.log('Failed to upload file to S3')
    }
  }
  xhr.onerror = function () {
    console.log('Failed to upload file to S3')
  }
  xhr.setRequestHeader('Content-Type', contentType)
  xhr.send(content)
}

function dataURLtoBlob (dataURL) {
  var BASE64_MARKER = ';base64,'
  var parts, contentType, raw

  if (dataURL.indexOf(BASE64_MARKER) === -1) {
    parts = dataURL.split(',')
    contentType = parts[0].split(':')[1]
    raw = decodeURIComponent(parts[1])

    return new Blob([raw], {
      type: contentType
    })
  }
  parts = dataURL.split(BASE64_MARKER)
  contentType = parts[0].split(':')[1]
  raw = window.atob(parts[1])
  var rawLength = raw.length
  var uInt8Array = new Uint8Array(rawLength)
  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], {
    type: contentType
  })
}
