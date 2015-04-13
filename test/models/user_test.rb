require 'test_helper'

class UserTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  
  should have_many(:businesses)
  
  should validate_presence_of(:first_name)
  should validate_presence_of(:last_name)
  should validate_presence_of(:password_digest)
  should validate_presence_of(:street_1)
  should validate_presence_of(:city)
  
  should allow_value('administrator').for(:role)
  should allow_value('business owner').for(:role)
  should allow_value('member').for(:role)
  
  should_not allow_value(nil).for(:role)
  should_not allow_value('admin').for(:role)
  
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
  
  should allow_value("name@me.com").for(:email)
  should allow_value("me@andrew.cmu.edu").for(:email)
  should allow_value("my_name@me.org").for(:email)
  should allow_value("name123@me.gov").for(:email)
  should allow_value("my.name@me.net").for(:email)
  
  should_not allow_value(nil).for(:email)
  should_not allow_value("name").for(:email)
  should_not allow_value("name@me,com").for(:email)
  should_not allow_value("name@me.uk").for(:email)
  should_not allow_value("my name@me.com").for(:email)
  should_not allow_value("name@me.con").for(:email)
  
  should allow_value('AL').for(:state)
  should allow_value('CA').for(:state)
  
  should_not allow_value(nil).for(:state)
  should_not allow_value('state').for(:state)
  
  should allow_value('15213').for(:zip_code)
  should allow_value('21042').for(:zip_code)
  
  should_not allow_value('152133').for(:zip_code)
  should_not allow_value('1521').for(:zip_code)
  should_not allow_value(nil).for(:zip_code)
  
  context "With a proper context, " do
    
    setup do
      create_contexts
    end
    
    teardown do
      remove_contexts
    end
    
    #scopes
    
    should "sort users in alphabetical order" do
      assert_equal ["Black, John", "Jones, Tim", "Smith, Amy"], User.alphabetical.map(&:name)
    end
    
    should "show that there are 2 active users" do
      assert_equal ["Black, John", "Smith, Amy"], User.active.alphabetical.map(&:name)
    end
    
    should "show that there is 1 inactive user" do
      assert_equal ["Jones, Tim"], User.inactive.alphabetical.map(&:name)
    end
    
    #methods
    
    should "show that there is a working proper name method" do
      assert_equal "John Black", @john.proper_name
      assert_equal "Amy Smith", @amy.proper_name
      assert_equal "Tim Jones", @tim.proper_name
    end
    
    should "show that there is a working name method" do
      assert_equal "Black, John", @john.name
      assert_equal "Smith, Amy", @amy.name
      assert_equal "Jones, Tim", @tim.name
    end
    
    should "have a method to identify geocoordinates" do
      assert_in_delta(40.4411533, @john.latitude, 0.0001)
      assert_in_delta(-79.9421533, @john.longitude, 0.0001)
    end
    
  end
  
end
