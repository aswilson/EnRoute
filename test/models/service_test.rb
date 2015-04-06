require 'test_helper'

class ServiceTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  
  should have_many(:business_services)
  should have_many(:businesses).through(:business_services)
  
  should validate_presence_of(:name)
  
  context "With a proper context, " do
    
    setup do
      create_contexts
    end
    
    teardown do
      remove_contexts
    end
    
    #scopes
    
    should "sort services in alphabetical order" do
      assert_equal ["bagels","coffee","cupcakes"], Service.alphabetical.map(&:name)
    end
    
    should "show that there are 2 active services" do
      assert_equal ["bagels", "coffee"], Service.active.alphabetical.map(&:name)
    end
    
    should "show that there is 1 inactive service" do
      assert_equal ["cupcakes"], Service.inactive.alphabetical.map(&:name)
    end
    
  end
end
