class Service < ActiveRecord::Base
  has_many :business_services
  has_many :businesses, through: :business_services
  
end
