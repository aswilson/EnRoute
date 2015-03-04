require 'test_helper'

class BusinessesControllerTest < ActionController::TestCase
  setup do
    @business = businesses(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:businesses)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create business" do
    assert_difference('Business.count') do
      post :create, business: { active: @business.active, city: @business.city, description: @business.description, latitude: @business.latitude, longitude: @business.longitude, name: @business.name, number_of_raters: @business.number_of_raters, phone: @business.phone, rating: @business.rating, schedule: @business.schedule, state: @business.state, street_1: @business.street_1, street_2: @business.street_2, user_id: @business.user_id, zip_code: @business.zip_code }
    end

    assert_redirected_to business_path(assigns(:business))
  end

  test "should show business" do
    get :show, id: @business
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @business
    assert_response :success
  end

  test "should update business" do
    patch :update, id: @business, business: { active: @business.active, city: @business.city, description: @business.description, latitude: @business.latitude, longitude: @business.longitude, name: @business.name, number_of_raters: @business.number_of_raters, phone: @business.phone, rating: @business.rating, schedule: @business.schedule, state: @business.state, street_1: @business.street_1, street_2: @business.street_2, user_id: @business.user_id, zip_code: @business.zip_code }
    assert_redirected_to business_path(assigns(:business))
  end

  test "should destroy business" do
    assert_difference('Business.count', -1) do
      delete :destroy, id: @business
    end

    assert_redirected_to businesses_path
  end
end
