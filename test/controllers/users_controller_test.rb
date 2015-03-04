require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  setup do
    @user = users(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:users)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create user" do
    assert_difference('User.count') do
      post :create, user: { active: @user.active, active_after: @user.active_after, email: @user.email, first_name: @user.first_name, last_name: @user.last_name, latitute: @user.latitute, longitude: @user.longitude, password_digest: @user.password_digest, password_reset_sent_at: @user.password_reset_sent_at, password_reset_token: @user.password_reset_token, phone: @user.phone, role: @user.role, username: @user.username }
    end

    assert_redirected_to user_path(assigns(:user))
  end

  test "should show user" do
    get :show, id: @user
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @user
    assert_response :success
  end

  test "should update user" do
    patch :update, id: @user, user: { active: @user.active, active_after: @user.active_after, email: @user.email, first_name: @user.first_name, last_name: @user.last_name, latitute: @user.latitute, longitude: @user.longitude, password_digest: @user.password_digest, password_reset_sent_at: @user.password_reset_sent_at, password_reset_token: @user.password_reset_token, phone: @user.phone, role: @user.role, username: @user.username }
    assert_redirected_to user_path(assigns(:user))
  end

  test "should destroy user" do
    assert_difference('User.count', -1) do
      delete :destroy, id: @user
    end

    assert_redirected_to users_path
  end
end
