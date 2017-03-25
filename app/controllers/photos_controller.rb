class PhotosController < ApplicationController
  def index
    @photos = current_user.photos.complete.by_date
    @models = @photos.complete.pluck("meta -> 'Model'").uniq
    @years = years
  end

  def create
    photo = current_user.photos.create!(
      photo_params.merge(
        complete: false
      )
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

  private

  def years
    dates = @photos.complete.pluck(
      "date_part('year', date_time_original)",
      "date_part('month', date_time_original)",
    ).uniq.each_with_object({}) do |date, o|
      year, month = date.map(&:to_i)
      o[year] ||= []
      o[year] << month
    end
  end

  def photo_params
    meta_params = params[:photo][:meta].keys
    photo_params = params.require(:photo).permit(:size, :content_type, meta: [meta_params])
    photo_params[:date_time_original] = DateTime.strptime(params[:photo][:meta]['DateTimeOriginal'], '%Y:%m:%d %H:%M:%S')
    photo_params
  end
end
