require 'test_helper'

class BusinessServiceTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  
  should belong_to(:business)
  should belong_to(:service)
  
  
  #@bs2 = FactoryGirl.create(:business_service, business: @dozen, service: @cupcake, active: false)
  
  
end
