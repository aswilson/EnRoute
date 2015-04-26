class BusinessServicesController < ApplicationController
  before_action :set_business_service, only: [:show, :edit, :update, :destroy]
  before_action :check_login
  authorize_resource

  # GET /business_services
  # GET /business_services.json
  def index
    @business_services = BusinessService.all
  end

  # GET /business_services/1
  # GET /business_services/1.json
  def show
  end

  # GET /business_services/new
  def new
    @business_service = BusinessService.new
  end

  # GET /business_services/1/edit
  def edit
  end

  # POST /business_services
  # POST /business_services.json
  def create
    @business_service = BusinessService.new(business_service_params)

    respond_to do |format|
      if @business_service.save
        format.html { redirect_to @business_service, notice: 'Business service was successfully created.' }
        format.json { render action: 'show', status: :created, location: @business_service }
      else
        format.html { render action: 'new' }
        format.json { render json: @business_service.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /business_services/1
  # PATCH/PUT /business_services/1.json
  def update
    respond_to do |format|
      if @business_service.update(business_service_params)
        format.html { redirect_to @business_service, notice: 'Business service was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @business_service.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /business_services/1
  # DELETE /business_services/1.json
  def destroy
    @business_service.destroy
    respond_to do |format|
      format.html { redirect_to business_services_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_business_service
      @business_service = BusinessService.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def business_service_params
      params.require(:business_service).permit(:business_id, :service_id, :active)
    end
end
