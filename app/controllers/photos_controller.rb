class PhotosController < ApplicationController
  def index
    @photos = current_user.photos.where(complete: true)
  end

  def complete
    photo = current_user.photos.find(params[:photo_id])
    photo.update(complete: true)
  end
end
