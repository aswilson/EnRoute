class Business < ActiveRecord::Base
  belongs_to :user
  has_many :business_services
  has_many :services, through: :business_services
  
end
