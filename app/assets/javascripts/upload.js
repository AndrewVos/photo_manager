/* globals $, EXIF, XMLHttpRequest, XDomainRequest, Blob, FileReader, Image */

// function createCORSRequest (method, url) {
//   var xhr = new XMLHttpRequest()
//   if ('withCredentials' in xhr) {
//     xhr.open(method, url, true)
//   } else if (typeof XDomainRequest !== 'undefined') {
//     xhr = new XDomainRequest()
//     xhr.open(method, url)
//   } else {
//     xhr = null
//   }
//   return xhr
// }

// function showUploadPlaceholder ($textarea, name) {
//   var uploadPlaceholder = '![Uploading ' + name + '...]()\r\n'
//   var selectionStart = $textarea[0].selectionStart
//   $textarea.val(
//     [$textarea.val().slice(0, selectionStart), uploadPlaceholder, $textarea.val().slice(selectionStart)].join('')
//   )
// }

// function showCompletedUploadPlaceholder ($textarea, name, url) {
//   var oldPlaceholder = '![Uploading ' + name + '...]()'
//   var newPlaceholder = '![' + name + '](' + url + ')'
//   $textarea.val($textarea.val().replace(oldPlaceholder, newPlaceholder))
// }

// function setupDragDropFileUpload () {
//   $('.js-textarea-file-upload').on('drop', textAreaDrop)
// }

// function uploadFiletoS3 ($textarea, name, type, content) {
//   showUploadPlaceholder($textarea, name)

//   var url = '/generate_signed_s3_url?file_name=' + encodeURIComponent(name) + '&content_type=' + encodeURIComponent(type)
//   $.getJSON(url, function (data) {
//     var xhr = createCORSRequest('PUT', data.put_url)
//     xhr.onload = function () {
//       if (xhr.status === 200) {
//         showCompletedUploadPlaceholder($textarea, name, data.public_url)
//       } else {
//         console.log('Failed to upload file to S3')
//       }
//     }

//     xhr.onerror = function () {
//       console.log('Failed to upload file to S3')
//     }

//     xhr.setRequestHeader('Content-Type', type)
//     xhr.send(content)
//   })
// }

// function setupPasteFileUpload () {
//   // Ensure that jQuery passes clipboardData to event object on paste
//   $.event.props.push('clipboardData')

//   $('.js-textarea-file-upload').bind('paste', textareaPaste)
// }

// function textAreaDrop (event) {
//   event.preventDefault()

//   var $textarea = $(this)
//   var dataTransfer = event.originalEvent.dataTransfer

//   for (var i = 0; i < dataTransfer.files.length; i++) {
//     var file = dataTransfer.files[i]
//     uploadFiletoS3($textarea, file.name, file.type, file)
//   }
// }

// function textareaPaste (event) {
//   var $textarea = $(this)
//   if (event.clipboardData.items) { // Chrome
//     var items = event.clipboardData.items
//     if (items) {
//       for (var i = 0; i < items.length; i++) {
//         if (items[i].type === 'image/png') {
//           var blob = items[i].getAsFile()
//           var fileName = 'image.png'
//           uploadFiletoS3($textarea, fileName, items[i].type, blob)
//         }
//       }
//     }
//   }
// }

// function setupButtonClickFileUpload () {
//   $('.js-button-file-upload').click(function () {
//     var $button = $(this)
//     var uploader = $('<input type="file" multiple id="t-file-input" class="hidden"></input>')
//     $button.parent().append(uploader)
//     var $textarea = $($button.data('upload-target'))
//     uploader.on('change', function () {
//       for (var i = 0; i < this.files.length; i++) {
//         var file = this.files[i]
//         uploadFiletoS3($textarea, file.name, file.type, file)
//       }
//     })

//     uploader.click()

//     return false
//   })
// }

// $(document).on('turbolinks:load', setupDragDropFileUpload)
// $(document).on('turbolinks:load', setupPasteFileUpload)
// $(document).on('turbolinks:load', setupButtonClickFileUpload)
//
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

      $.getJSON('/signed_url?name=' + encodeURIComponent(file.name) + '&content_type=' + encodeURIComponent(file.type), function (data) {
        var url = data.signed_url
        var xhr = createCORSRequest('PUT', url)
        xhr.onload = function () {
          if (xhr.status === 200) {
            console.log('uploaded!')
          } else {
            console.log('Failed to upload file to S3')
          }
        }

        xhr.onerror = function () {
          console.log('Failed to upload file to S3')
        }

        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)

        $('.js-current-image p').text(
          'Image ' + (index + 1)
        )

        var $metadata = $('.js-image-metadata')
        $metadata.empty()
        for (var key in metadata) {
          $metadata.append($('<div>' + key + ': ' + metadata[key] + '</div>'))
        }

        image = null

        uploadPhoto(index + 1, input)
      })
    }

    reader.readAsDataURL(file)
  })
}
// var prefsize

// function dataURLtoBlob (dataURL) {
//   var BASE64_MARKER = ';base64,'
//   if (dataURL.indexOf(BASE64_MARKER) === -1) {
//     var parts = dataURL.split(',')
//     var contentType = parts[0].split(':')[1]
//     var raw = decodeURIComponent(parts[1])

//     return new Blob([raw], {
//       type: contentType
//     })
//   }
//   var parts = dataURL.split(BASE64_MARKER)
//   var contentType = parts[0].split(':')[1]
//   var raw = window.atob(parts[1])
//   var rawLength = raw.length
//   var uInt8Array = new Uint8Array(rawLength)
//   for (var i = 0; i < rawLength; ++i) {
//     uInt8Array[i] = raw.charCodeAt(i)
//   }

//   return new Blob ([uInt8Array], {
//     type: contentType
//   })
// }

// function validateImage () {
// }

// function clearcanvas () {
//   prefsize = {
//     x: 0,
//     y: 0,
//     w: canvas.width,
//     h: canvas.height
//   }
// }

// function selectcanvas (coords) {
//   prefsize = {
//     x: Math.round(coords.x),
//     y: Math.round(coords.y),
//     w: Math.round(coords.w),
//     h: Math.round(coords.h)
//   }
// }

// function applyCrop () {
//   canvas.width = prefsize.w
//   canvas.height = prefsize.h
//   context.drawImage(image, prefsize.x, prefsize.y, prefsize.w, prefsize.h, 0, 0, canvas.width, canvas.height)
//   validateImage()
// }

// function applyScale (scale) {
//   if (scale == 1) return
//   canvas.width = canvas.width * scale
//   canvas.height = canvas.height * scale
//   context.drawImage(image, 0, 0, canvas.width, canvas.height)
//   validateImage()
// }

// function applyRotate () {
//   canvas.width = image.height
//   canvas.height = image.width
//   context.clearRect(0, 0, canvas.width, canvas.height)
//   context.translate(image.height / 2, image.width / 2)
//   context.rotate(Math.PI / 2)
//   context.drawImage(image, -image.width / 2, -image.height / 2)
//   validateImage()
// }

// function applyHflip () {
//   context.clearRect(0, 0, canvas.width, canvas.height)
//   context.translate(image.width, 0)
//   context.scale(-1, 1)
//   context.drawImage(image, 0, 0)
//   validateImage()
// }

// function applyVflip () {
//   context.clearRect(0, 0, canvas.width, canvas.height)
//   context.translate(0, image.height)
//   context.scale(1, -1)
//   context.drawImage(image, 0, 0)
//   validateImage()
// }

// $('#cropbutton').click(function (e) {
//   applyCrop()
// })
// $('#scalebutton').click(function (e) {
//   var scale = prompt('Scale Factor:', '1')
//   applyScale(scale)
// })
// $('#rotatebutton').click(function (e) {
//   applyRotate()
// })
// $('#hflipbutton').click(function (e) {
//   applyHflip()
// })
// $('#vflipbutton').click(function (e) {
//   applyVflip()
// })

// $('#form').submit(function (e) {
//   e.preventDefault()
//   formData = new FormData($(this)[0])
//   var blob = dataURLtoBlob(canvas.toDataURL('image/png'))
//   // ---Add file blob to the form data
//   formData.append('cropped_image[]', blob)
//   $.ajax({
//     url: 'whatever.php',
//     type: 'POST',
//     data: formData,
//     contentType: false,
//     cache: false,
//     processData: false,
//     success: function (data) {
//       alert('Success')
//     },
//     error: function (data) {
//       alert('Error')
//     },
//     complete: function (data) {}
//   })
// })

