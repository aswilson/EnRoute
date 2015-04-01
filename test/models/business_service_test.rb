require 'test_helper'

class BusinessServiceTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  
  should belong_to(:business)
  should belong_to(:service)
  
  should allow_value(1).for(:business_id)
  should allow_value(5).for(:business_id)
  should_not allow_value(nil).for(:business_id)
  should_not allow_value(0).for(:business_id)
  
  should allow_value(1).for(:service_id)
  should allow_value(5).for(:service_id)
  should_not allow_value(nil).for(:service_id)
  should_not allow_value(0).for(:service_id)
  
  
end
