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
  should allow_value('user').for(:role)
  
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
  
end
