json.array!(@favorites) do |favorite|
  json.extract! favorite, :id, :name, :street_1, :street_2, :city, :state, :zip_code, :latitude, :longitude, :category, :notes, :user_id, :business_id
#  json.url favorite_url(favorite, format: :json)
end
