class Photo < ApplicationRecord
  belongs_to :user

  scope :complete, -> { where(complete: true) }
  scope :by_date, -> { order(date_time_original: :desc) }

  def original_name
    "#{user.id}-#{id}"
  end

  def thumbnail_name
    "#{user.id}-#{id}-thumbnail"
  end

  def thumbnail_url
    GoogleStorage.signed_url(method: :get, name: thumbnail_name, expires: 1.week.from_now)
  end

  def original_url
    GoogleStorage.signed_url(method: :get, name: original_name, expires: 1.week.from_now)
  end

  def thumbnail_put_url
    GoogleStorage.signed_url(
      method: :put,
      name: thumbnail_name,
      expires: 5.minutes.from_now,
      content_type: content_type
    )
  end

  def original_put_url
    GoogleStorage.signed_url(
      method: :put,
      name: original_name,
      expires: 5.minutes.from_now,
      content_type: content_type
    )
  end
end
