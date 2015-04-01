require 'test_helper'

class ServiceTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  
  should have_many(:business_services)
  should have_many(:businesses).through(:business_services)
  
  should validate_presence_of(:name)
end
