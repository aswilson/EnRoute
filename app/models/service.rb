class Service < ActiveRecord::Base
  
  has_many :business_services
  has_many :businesses, through: :business_services
  
  #validations
  validates :name, presence: true, uniqueness: { case_sensitive: false }
  
  #scopes
  scope :alphabetical, -> { order('name') }
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :by_name, -> (name) {where("name = ?", name)}
  
  #callbacks
  before_validation :default_active
  
  private
  def default_active
    self.active = true if self.active.nil?
  end
  
end
