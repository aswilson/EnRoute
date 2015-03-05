class BusinessService < ActiveRecord::Base
  belongs_to :business
  belongs_to :service 
  
end
