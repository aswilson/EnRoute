json.array!(@business_services) do |business_service|
  json.extract! business_service, :id, :business_id, :service_id, :active
  json.url business_service_url(business_service, format: :json)
end
