require 'test_helper'

class BusinessServiceTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  
  should belong_to(:business)
  should belong_to(:service)
  
  
  #@bs2 = FactoryGirl.create(:business_service, business: @dozen, service: @cupcake, active: false)
  
  
  context "With a proper context, " do
    
    setup do
      create_contexts
    end
    
    teardown do
      remove_contexts
    end
    
    #scopes
    
    should "not allow the same service to be assigned to the same business twice" do
      bad_assignment = FactoryGirl.build(:business_service, business: @starbucks, service: @coffee)
      deny bad_assignment.valid?
    end
    
    should "not allow a business to be assigned an inactive service" do
      bad_assignment = FactoryGirl.build(:business_service, business: @factory, service: @cupcakes)
      deny bad_assignment.valid?
    end
    
    should "not allow a service to be assigned an inactive business" do
      bad_assignment = FactoryGirl.build(:business_service, business: @dozen, service: @coffee)
      deny bad_assignment.valid?
    end
    
  end
  
end
