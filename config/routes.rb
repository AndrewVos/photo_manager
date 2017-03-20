Rails.application.routes.draw do
  devise_for :users

  root 'home#index'

  get '/signed_url', to: 'signed_url#signed_url'

  resources :photos, only: %i(index)
end
