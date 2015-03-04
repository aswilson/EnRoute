json.array!(@businesses) do |business|
  json.extract! business, :id, :name, :description, :phone, :schedule, :street_1, :street_2, :city, :state, :zip_code, :latitude, :longitude, :rating, :number_of_raters, :user_id, :active
  json.url business_url(business, format: :json)
end
