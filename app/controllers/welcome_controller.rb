class WelcomeController < ApplicationController
  def findHome
    #@username = params["apple"];
    #@current_user = User.find(10)
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
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
    @point = params["fixedPoint"]
    @label = params["label"]
    @num = params["num"]
    #@current_user = User.find(10)
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
    @favs = Favorite.for_user(@current_user.id).map(&:label).all
    @services = Service.active.all.map(&:name)
    @coord = Geocoder.coordinates(@label)
    @businesses = Business.active.all.map(&:name)
    if @favs.include?(@label)
      @fav = Favorite.by_label(@label)
      @lat = @fav.latitude
      @lon = @fav.longitude
      @addr = @fav.street_1 + ' ' + @fav.city + ', ' + @fav.state + ' ' + @fav.zip_code
      @reply = {"lat"=>@lat, "lon"=>@lon, "name"=>@name, "addr"=>@addr}
    elsif @coord then
      @reply = {"addr"=>@coord}
    elsif @services.include?(@label)
      @service = Service.by_name(@label)
      @businesses = Business.by_service(@service.id).nearby(@point[0], @point[1], 30).limit(@num)
      @list = []
      for business in @businesses
        @lat = business.latitude
        @lon = business.longitude
        @name = business.name
        @addr = business.street_1 + ' ' + business.city + ', ' + business.state + ' ' + business.zip_code
        @list += [@lat,@lon,@name,@addr]
      end
      @reply = {"businesses"=>@list}
    elsif @business.include?(@label)
      #assumes unique name
      @business = Business.by_name(@label)
      @lat = @business.latitude
      @lon = @business.longitude
      @name = @business.name
      @addr = @business.street_1 + ' ' + @business.city + ', ' + @business.state + ' ' + @business.zip_code
      @reply = {"lat"=>@lat, "lon"=>@lon, "name"=>@name, "addr"=>@addr}
    else
      @reply = "Input is not acceptable"
    end
    respond_to do |format|
      format.json {render json: @reply}
    end
  end
end
