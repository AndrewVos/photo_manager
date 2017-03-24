class SignedUrlController < ApplicationController
  def signed_url
    photo = current_user.photos.create!(complete: false)

    original_name = "#{current_user.id}-#{photo.id}"
    thumbnail_name = "#{current_user.id}-#{photo.id}-thumbnail"

    render json: {
      id: photo.id,
      original_name: original_name,
      thumbnail_name: thumbnail_name,
      original_url: create_signed_url(original_name, params[:content_type]),
      thumbnail_url: create_signed_url(thumbnail_name, params[:content_type])
    }
  end

  private

  def create_signed_url(name, content_type)
    require 'google/cloud/storage'

    storage = Google::Cloud::Storage.new
    bucket = storage.bucket(ENV.fetch('GOOGLE_CLOUD_STORAGE_BUCKET'))

    bucket.signed_url(
      name,
      content_type: content_type,
      method: 'PUT',
      expires: 300
    )
  end
end
