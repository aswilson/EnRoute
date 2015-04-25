class WelcomeController < ApplicationController
  def findHome
    @services = Service.all
    respond_to do |format|
      format.json { render json: @services }
    end
  end
end
