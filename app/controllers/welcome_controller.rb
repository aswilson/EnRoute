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
        @reply.merge!({label => ["lat" => @lat, "lon" => @lon, "name" => @name, "addr" => @addr]})
      elsif @favs.include?(label.downcase)
        @lat = Favorite.by_category(label.downcase).map(&:latitude)[0]
        @lon = Favorite.by_category(label.downcase).map(&:longitude)[0]
        @addr = Favorite.by_category(label.downcase).map(&:street_1)[0] + ' ' + Favorite.by_category(label.downcase).map(&:city)[0] + ', ' + Favorite.by_category(label.downcase).map(&:state)[0] + ' ' + Favorite.by_category(label.downcase).map(&:zip_code)[0]
        @reply.merge!({label => ["lat" => @lat, "lon" => @lon, "name" => @name, "addr" => @addr]})
      elsif @services.include?(label)
        @service = Service.by_name(label)[0]
        p = 0
        while p < @points.length do
          @point = @points.fetch("0")
          @businesses = Business.by_service(@service.id).near([@point.fetch("lat"), @point.fetch("lon")], 10).limit(@num).map(&:name)
          b = 0
          @options = []
          while b < @businesses.length
            name = @businesses[b]
            @lat = Business.by_name(name).map(&:latitude)[0]
            @lon = Business.by_name(name).map(&:longitude)[0]
            @name = Business.by_name(name).map(&:name)[0]
            @addr = Business.by_name(name).map(&:street_1)[0] + ' ' + Business.by_name(name).map(&:city)[0] + ', ' + Business.by_name(name).map(&:state)[0] + ' ' + Business.by_name(name).map(&:zip_code)[0]
            @options += (["lat" => @lat, "lon" => @lon, "name" => @name, "addr" => @addr])
            b += 1
          end
          @reply.merge!({label => @options})
          p += 1
        end
      elsif @services.include?(label.capitalize)
        @service = Service.by_name(label.capitalize)[0]
        p = 0
        while p < @points.length do
          @point = @points.fetch("0")
          @businesses = Business.by_service(@service.id).near([@point.fetch("lat"), @point.fetch("lon")], 10).limit(@num).map(&:name)
          b = 0
          @options = []
          while b < @businesses.length
            name = @businesses[b]
            @lat = Business.by_name(name).map(&:latitude)[0]
            @lon = Business.by_name(name).map(&:longitude)[0]
            @name = Business.by_name(name).map(&:name)[0]
            @addr = Business.by_name(name).map(&:street_1)[0] + ' ' + Business.by_name(name).map(&:city)[0] + ', ' + Business.by_name(name).map(&:state)[0] + ' ' + Business.by_name(name).map(&:zip_code)[0]
            @options += (["lat" => @lat, "lon" => @lon, "name" => @name, "addr" => @addr])
            b += 1
          end
          @reply.merge!({label => @options})
          p += 1
        end
      elsif @businesses.include?(label) or @businesses.include?(label.capitalize)
        #assumes unique name
        @lat = Business.by_name(label).map(&:latitude)[0]
        @lon = Business.by_name(label).map(&:longitude)[0]
        @name = Business.by_name(label).map(&:name)[0]
        @addr = Business.by_name(label).map(&:street_1)[0] + ' ' + Business.by_name(label).map(&:city)[0] + ', ' + Business.by_name(label).map(&:state)[0] + ' ' + Business.by_name(label).map(&:zip_code)[0]
        @reply.merge!({label => ["lat"=>@lat, "lon"=>@lon, "name"=>@name, "addr"=>@addr]})
      elsif Geocoder.coordinates(label) then
        @coord = Geocoder.coordinates(label)
        @reply.merge!({label => ["lat"=>@coord[0], "lon"=>@coord[1],"name"=>"", "addr"=>@label]})
      else
        @reply.merge!({label => "Input is not acceptable"})
      end
      l += 1
    end
    respond_to do |format|
      format.json {render json: @reply}
    end
  end
end
