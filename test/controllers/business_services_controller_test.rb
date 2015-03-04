require 'test_helper'

class BusinessServicesControllerTest < ActionController::TestCase
  setup do
    @business_service = business_services(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:business_services)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create business_service" do
    assert_difference('BusinessService.count') do
      post :create, business_service: { active: @business_service.active, business_id: @business_service.business_id, service_id: @business_service.service_id }
    end

    assert_redirected_to business_service_path(assigns(:business_service))
  end

  test "should show business_service" do
    get :show, id: @business_service
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @business_service
    assert_response :success
  end

  test "should update business_service" do
    patch :update, id: @business_service, business_service: { active: @business_service.active, business_id: @business_service.business_id, service_id: @business_service.service_id }
    assert_redirected_to business_service_path(assigns(:business_service))
  end

  test "should destroy business_service" do
    assert_difference('BusinessService.count', -1) do
      delete :destroy, id: @business_service
    end

    assert_redirected_to business_services_path
  end
end
