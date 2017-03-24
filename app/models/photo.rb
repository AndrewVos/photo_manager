class Photo < ApplicationRecord
  belongs_to :user

  def original_name
    "#{user.id}-#{id}"
  end

  def thumbnail_name
    "#{user.id}-#{id}-thumbnail"
  end

  def thumbnail_url
    signed_url(thumbnail_name)
  end

  def original_url
    signed_url(original_name)
  end

  def storage_configuration
    @keyfile ||= JSON.parse(ENV.fetch('GOOGLE_CLOUD_KEYFILE_JSON'))
  end

  def signed_url(name)
    full_path = "/#{ENV.fetch('GOOGLE_CLOUD_STORAGE_BUCKET')}/#{name}"
    expiration = 5.minutes.from_now.to_i

    signature = ['GET', '', '', expiration, full_path].join("\n")

    digest = OpenSSL::Digest::SHA256.new
    signer = OpenSSL::PKey::RSA.new(storage_configuration['private_key'])
    signature = Base64.strict_encode64(signer.sign(digest, signature))
    signature = CGI.escape(signature)

    "https://storage.googleapis.com#{full_path}?GoogleAccessId=#{storage_configuration['client_email']}&Expires=#{expiration}&Signature=#{signature}"
  end

  private

  def bucket
    require 'google/cloud/storage'

    storage = Google::Cloud::Storage.new
    storage.bucket(ENV.fetch('GOOGLE_CLOUD_STORAGE_BUCKET'))
  end
end
