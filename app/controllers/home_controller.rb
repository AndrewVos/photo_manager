class HomeController < ApplicationController
  def index
    redirect_to photos_path if user_signed_in?
  end
end
