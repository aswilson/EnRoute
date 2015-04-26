class WelcomeController < ApplicationController
  def findHome
    #@username = params["username"];
    @current_user = User.find(10)
    #@current_user ||= User.find(session[:user_id]) if session[:user_id]
    @addr = @current_user.street_1 + ' ' + @current_user.city + ', ' + @current_user.state + ' ' + @current_user.zip_code
    @lat = @current_user.latitude
    @lon = @current_user.longitude
    @reply = {'addr'=>@addr,
        'lat'=>@lat,
        'lon'=>@lon}
    respond_to do |format|
      format.json {render json: @reply}
    end
  end
  
  def getAllNearby
    #if label = thing in favs pick that
    #if label = address pick that
    #if label = service do below
    #if label = business name do that
    # above options must be a list
    #if label is nothing relevant/acceptable = return a string rather than a list
    #accepts lat,long as fixedpoints and label and n is num points closesr
    #need business.by_service
    #give Business.nearby(lat, long, dist?) limit by n
    #provide that thing as lat, long
  end
end
