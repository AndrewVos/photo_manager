Rails.application.routes.draw do
  devise_for :users

  root 'home#index'

  resources :photos, only: %i(index create show) do
    post 'complete'
    collection do
      get 'map'
      get 'map/locations', controller: :photos, action: :locations
    end
  end
end
