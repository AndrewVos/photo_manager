class PhotosController < ApplicationController
  def index
    @photos = current_user.photos.where(complete: true)
  end

  def create
    photo = current_user.photos.create!(
      size: params[:size],
      content_type: params[:content_type],
      complete: false
    )

    render json: {
      id: photo.id,
      original_url: photo.original_put_url,
      thumbnail_url: photo.thumbnail_put_url
    }
  end

  def complete
    photo = current_user.photos.find(params[:photo_id])
    photo.update(complete: true)
  end
end
