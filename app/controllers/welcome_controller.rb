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
    @points = params["fixedPoints"]
    @labels = params["labels"]
    @num = params["n"]
    #@current_user = User.find(10)
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
    @reply = {}
    i = 1
    l = 0
    while l < @labels.length do
      label = @labels[l]
      @favs = Favorite.for_user(@current_user.id).map(&:category)
      @services = Service.active.map(&:name)
      @businesses = Business.active.map(&:name)
      if @favs.include?(label)
        @lat = Favorite.by_category(label).map(&:latitude)[0]
        @lon = Favorite.by_category(label).map(&:longitude)[0]
        @addr = Favorite.by_category(label).map(&:street_1)[0] + ' ' + Favorite.by_category(label).map(&:city)[0] + ', ' + Favorite.by_category(label).map(&:state)[0] + ' ' + Favorite.by_category(label).map(&:zip_code)[0]
        @reply.merge({i.to_s => ["lat"=>@lat, "lon"=>@lon, "name"=>@name, "addr"=>@addr]})
      elsif @services.include?(label)
        @service = Service.by_name(label)
        for @point in @points do
          @businesses = Business.by_service(@service.id).nearby(@point[0], @point[1], 10).limit(@num)
          for @business in @businesses
            @lat = @business.latitude
            @lon = @business.longitude
            @name = @business.name
            @addr = @business.street_1 + ' ' + @business.city + ', ' + @business.state + ' ' + @business.zip_code
            @reply.merge({i.to_s => ["lat"=>@lat, "lon"=>@lon, "name"=>@name, "addr"=>@addr]})
          end
        end
      elsif @businesses.include?(label)
        #assumes unique name
        @business = Business.by_name(label)
        @lat = @business.latitude
        @lon = @business.longitude
        @name = @business.name
        @addr = @business.street_1 + ' ' + @business.city + ', ' + @business.state + ' ' + @business.zip_code
        @reply += ["lat"=>@lat, "lon"=>@lon, "name"=>@name, "addr"=>@addr]
      elsif Geocoder.coordinates(label) then
        @coord = Geocoder.coordinates(label)
        @reply.merge({i.to_s => ["lat"=>@coord[0], "lon"=>@coord[1],"name"=>"", "addr"=>@label]})
      else
        @reply = "Input is not acceptable"
      end
      i += 1
      l += 1
    end
    respond_to do |format|
      format.json {render json: @reply}
    end
  end
end
