class BusinessService < ActiveRecord::Base
  #include EnRouteHelpers
  
  #relationships
  belongs_to :business
  belongs_to :service 
  
  #validations
  validates :business_id, presence: true, numericality: { greater_than: 0, only_integer: true }
  validates :service_id, presence: true, numericality: { greater_than: 0, only_integer: true }
  validate :service_is_not_already_assigned_to_business, on: :create
  validate :service_is_active_in_system
  validate :business_is_active_in_system
  
  private
  def service_is_not_already_assigned_to_business
    return true if self.business.nil? || self.service.nil?
    unless BusinessService.where(business_id: self.business_id, service_id: self.service_id).to_a.empty?
      errors.add(:base, "Service has already been assigned to this business")
    end
  end
  
  def service_is_active_in_system
    is_active_in_system(:service)
  end

  def business_is_active_in_system
    is_active_in_system(:business)  
  end
end
