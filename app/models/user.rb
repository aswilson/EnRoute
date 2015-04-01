class User < ActiveRecord::Base
  has_many :businesses
  
  role_array = ["administrator", "business owner", "user"]
  
  #validations
  validates_presence_of :first_name, :last_name, :password_digest
  validates :username, presence: true, uniqueness: { case_sensitive: false }
  validates :role, inclusion: { in: role_array }, message: "is not a valid role", allow_blank: false 
  validates_format_of :phone, with: /\A(\d{10}|\(?\d{3}\)?[-. ]\d{3}[-.]\d{4})\z/, message: "should be 10 digits (area code needed) and delimited with dashes only"
  validates_format_of :email, :with => /\A[\w]([^@\s,;]+)@(([a-z0-9.-]+\.)+(com|edu|org|net|gov|mil|biz|info))\z/i, :message => "is not a valid format", :allow_blank => true
  
  #scopes
  scope :alphabetical, -> { order('last_name, first_name') }
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  
  #callbacks
  before_validation :default_active
  before_validation :get_location_coordinates
  
  #methods
  def proper_name
    first_name + " " + last_name
  end
  
  def name
    last_name + ", " + first_name
  end
  
  private
  #location function needs to be reformatted for use of cell phone locator coordinates
  def get_location_coordinates
    #str = self.street_1
    #zip = self.zip_code
    
    #coord = Geocoder.coordinates("#{str}, #{zip}")
    #if coord
    #  self.latitude = coord[0]
    #  self.longitude = coord[1]
    #else 
    #  errors.add(:base, "Error with geocoding")
    #end
    #coord
  end
  
end
