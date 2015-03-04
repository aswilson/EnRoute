json.array!(@users) do |user|
  json.extract! user, :id, :first_name, :last_name, :username, :password_digest, :active_after, :password_reset_token, :password_reset_sent_at, :email, :phone, :latitute, :longitude, :role, :active
  json.url user_url(user, format: :json)
end
