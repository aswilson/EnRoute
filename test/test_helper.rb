ENV["RAILS_ENV"] ||= "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'
require 'simplecov'
SimpleCov.start 'rails'
require 'turn/autorun'

class ActiveSupport::TestCase
  ActiveRecord::Migration.check_pending!

  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  #fixtures :all

  # Add more helper methods to be used by all tests here...
  
  def deny(condition)
    # a simple transformation to increase readability IMO
    assert !condition
  end
  
  def create_users
    @john = FactoryGirl.create(:user)
    #sleep 1
    @amy = FactoryGirl.create(:user, first_name: "Amy", last_name: "Smith", username: "itsamy", role: "business owner")
    #sleep 1
    @tim = FactoryGirl.create(:user, first_name: "Tim", last_name: "Jones", username: "timmy2", role: "user", active: false)
    #sleep 1
  end
  
  def remove_users
    @john.destroy
    @amy.destroy
    @tim.destroy
  end
  
  def create_services
    @coffee = FactoryGirl.create(:service)
    @cupcake = FactoryGirl.create(:service, name: "cupcakes", description: "specializes in cupcakes", active: false)
    @bagel = FactoryGirl.create(:service, name: "bagels", description: "offers an assortment of bagels")
  end
  
  def remove_services
    @coffee.destroy
    @cupcake.destroy
    @bagel.destroy
  end
  
  def create_businesses
    @starbucks = FactoryGirl.create(:business, user: @amy)
    #sleep 1
    @dozen = FactoryGirl.create(:business, name: "Dozen Cupcakes", description: "sells an assortment of gourmet cupcakes", active: false, user: @amy)
    #sleep 1
    @factory = FactoryGirl.create(:business, name: "Bagel Factory", description: "sells an assortment of bagels", active: true, user: @john)
    #sleep 1
  end
  
  def remove_businesses
    @starbucks.destroy
    @dozen.destroy
    @factory.destroy
  end
  
  def create_business_services
    @bs1 = FactoryGirl.create(:business_service, business: @starbucks, service: @coffee)
    @bs2 = FactoryGirl.create(:business_service, business: @factory, service: @coffee)
    @bs3 = FactoryGirl.create(:business_service, business: @factory, service: @bagel)
  end
  
  def remove_business_services
    @bs1.destroy
    @bs2.destroy
    @bs3.destroy
  end
  
  def create_contexts
    create_users
    create_services
    create_businesses
    create_business_services
  end
  
  def remove_contexts
    remove_users
    remove_services
    remove_businesses
    remove_business_services
  end
  
end

Turn.config.format = :outline