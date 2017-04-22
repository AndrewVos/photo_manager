class PhotosController < ApplicationController
  def index
    @back = params[:back]
    @years = current_user.photos.complete.uniq.order('ddd').pluck(
      "date_time_original::date AS ddd"
    ).each_with_object({}) do |date, result|
      result[date.year] ||= {}
      result[date.year][date.month] ||= []
      result[date.year][date.month] << date.day
    end

    @photos = current_user.photos.complete.by_date
    @photos = @photos.where("date_part('year', date_time_original) = ?", params[:year]) if params[:year]
    @photos = @photos.where("date_part('month', date_time_original) = ?", params[:month]) if params[:month]
    @photos = @photos.where("date_part('day', date_time_original) = ?", params[:day]) if params[:day]

    # @year_photos = current_user.photos.complete.select(
    #   "DISTINCT ON(year, month) *, date_part('year', date_time_original) AS year, date_part('month', date_time_original) AS month"
    # ).order('year, month, RANDOM()')

    # @year_photos = @year_photos.each_with_object({}) do |photo, o|
    #   o[photo.date_time_original.year] ||= []
    #   o[photo.date_time_original.year] << photo
    # end
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

  def show
    photo = current_user.photos.find(params[:id])
    url = params.key?(:thumbnail) ? photo.thumbnail_url : photo.original_url
    redirect_to url
  end

  def locations
    locations = current_user.photos.complete.pluck(:id, "meta -> 'GPSLatitudeRef'", "meta -> 'GPSLongitudeRef'", "meta -> 'GPSLatitude'", "meta -> 'GPSLongitude'")

    locations = locations.map do |location|
      next if location.compact.size != 5

      id, latitude_direction, longitude_direction, latitude_dms, longitude_dms = location

      latitude_dms = [latitude_dms['0'], latitude_dms['1'], latitude_dms['2']].map(&:to_f)
      longitude_dms = [longitude_dms['0'], longitude_dms['1'], longitude_dms['2']].map(&:to_f)

      {
        original: photo_path(id),
        thumbnail: photo_path(id, thumbnail: 1),
        latitude: dms_to_dd(latitude_direction, *latitude_dms),
        longitude: dms_to_dd(longitude_direction, *longitude_dms)
      }
    end.compact

    render json: locations
  end

  private

  def dms_to_dd(direction, degrees, minutes, seconds)
    dd = degrees + minutes / 60.0 + seconds / (60.0 * 60.0)

    if direction == 'S' || direction == 'W'
        dd * -1
    else
      dd
    end
  end

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
    photo_params = params.require(:photo).permit(:size, :content_type)
    photo_params[:date_time_original] = DateTime.strptime(params[:photo][:meta]['DateTimeOriginal'], '%Y:%m:%d %H:%M:%S')
    photo_params[:meta] = params[:photo][:meta].to_unsafe_h
    photo_params
  end
end
