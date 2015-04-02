require 'test_helper'

class BusinessServiceTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  
  should belong_to(:business)
  should belong_to(:service)
  
  
  
end
