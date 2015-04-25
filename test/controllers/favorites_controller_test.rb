require 'test_helper'

class FavoritesControllerTest < ActionController::TestCase
  setup do
    @favorite = favorites(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:favorites)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create favorite" do
    assert_difference('Favorite.count') do
      post :create, favorite: { business_id: @favorite.business_id, city: @favorite.city, latitude: @favorite.latitude, longitude: @favorite.longitude, name: @favorite.name, notes: @favorite.notes, state: @favorite.state, street_1: @favorite.street_1, street_2: @favorite.street_2, type: @favorite.type, user_id: @favorite.user_id, zip_code: @favorite.zip_code }
    end

    assert_redirected_to favorite_path(assigns(:favorite))
  end

  test "should show favorite" do
    get :show, id: @favorite
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @favorite
    assert_response :success
  end

  test "should update favorite" do
    patch :update, id: @favorite, favorite: { business_id: @favorite.business_id, city: @favorite.city, latitude: @favorite.latitude, longitude: @favorite.longitude, name: @favorite.name, notes: @favorite.notes, state: @favorite.state, street_1: @favorite.street_1, street_2: @favorite.street_2, type: @favorite.type, user_id: @favorite.user_id, zip_code: @favorite.zip_code }
    assert_redirected_to favorite_path(assigns(:favorite))
  end

  test "should destroy favorite" do
    assert_difference('Favorite.count', -1) do
      delete :destroy, id: @favorite
    end

    assert_redirected_to favorites_path
  end
end
