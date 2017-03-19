Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  #
  root 'home#index'

  get '/signed_url', to: 'signed_url#signed_url'
end
