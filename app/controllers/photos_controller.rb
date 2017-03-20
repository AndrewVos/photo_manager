class PhotosController < ApplicationController
  def index
    @photos = current_user.photos
  end

  def complete
    photo = current_user.photos.find(params[:photo_id])
    photo.retrieve_urls!
  end
end
