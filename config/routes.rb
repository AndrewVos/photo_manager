Rails.application.routes.draw do
  devise_for :users

  root 'home#index'

  resources :photos, only: %i(index create) do
    post 'complete'
  end
end
