require 'test_helper'

class BusinessTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  
  should belong_to(:user)
  should have_many(:business_services)
  should have_many(:services).through(:business_services)
  
  should validate_presence_of(:name)
  should validate_presence_of(:street_1)
  should validate_presence_of(:city)
  
  should allow_value('AL').for(:state)
  should allow_value('CA').for(:state)
  
  should_not allow_value(nil).for(:state)
  should_not allow_value('state').for(:state)
  
  should allow_value('15213').for(:zip_code)
  should allow_value('21042').for(:zip_code)
  
  should_not allow_value('152133').for(:zip_code)
  should_not allow_value('1521').for(:zip_code)
  should_not allow_value(nil).for(:zip_code)
  
  should allow_value("4122680000").for(:phone)
  should allow_value("412-268-0000").for(:phone)
  should allow_value("412.268.0000").for(:phone)
  should allow_value("(412) 268-0000").for(:phone)
  should allow_value(nil).for(:phone)
  
  should_not allow_value("2680000").for(:phone)
  should_not allow_value("4122680000x224").for(:phone)
  should_not allow_value("800-EAT-FOOD").for(:phone)
  should_not allow_value("412/268/0000").for(:phone)
  should_not allow_value("412-2683-259").for(:phone)
  
  
  context "With a proper context, " do
    
    setup do
      create_contexts
    end
    
    teardown do
      remove_contexts
    end
    
    #scopes
    
    should "sort businesses in alphabetical order" do
      assert_equal ["Bagel Factory","Dozen Cupcakes","Starbucks"], Business.alphabetical.map(&:name)
    end
    
    should "show that there are 2 active businesses" do
      assert_equal ["Bagel Factory", "Starbucks"], Business.active.alphabetical.map(&:name)
    end
    
    should "show that there is 1 inactive business" do
      assert_equal ["Dozen Cupcakes"], Business.inactive.alphabetical.map(&:name)
    end
    
    should "have a method to identify geocoordinates" do
      assert_in_delta(40.444592, @starbucks.latitude, 0.0001)
      assert_in_delta(-79.9485208, @starbucks.longitude, 0.0001)
    end
    
  end
  
end
