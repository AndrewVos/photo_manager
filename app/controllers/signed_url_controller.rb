class SignedUrlController < ApplicationController
  def signed_url
    require 'google/cloud/storage'

    storage = Google::Cloud::Storage.new
    bucket = storage.bucket(ENV.fetch('GOOGLE_CLOUD_STORAGE_BUCKET'))
    render json: {
      signed_url:  bucket.signed_url(
        params[:name],
        content_type: params[:content_type],
        method: 'PUT',
        expires: 300
      )
    }
  end
end
