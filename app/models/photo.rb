class Photo < ApplicationRecord
  belongs_to :user

  def original_name
    "#{user.id}-#{id}"
  end

  def thumbnail_name
    "#{user.id}-#{id}-thumbnail"
  end

  def retrieve_urls!
    update!(
      thumbnail_url: bucket.file(thumbnail_name).signed_url,
      original_url: bucket.file(original_name).signed_url
    )
  end

  private

  def bucket
    require 'google/cloud/storage'

    storage = Google::Cloud::Storage.new
    storage.bucket(ENV.fetch('GOOGLE_CLOUD_STORAGE_BUCKET'))
  end
end
