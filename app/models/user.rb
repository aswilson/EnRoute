class User < ActiveRecord::Base
  
  # Use built-in rails support for password protection
   has_secure_password
   
  has_many :businesses
  
  role_array = ["administrator", "business owner", "member"]
  
  STATES_LIST = [['Alabama', 'AL'],['Alaska', 'AK'],['Arizona', 'AZ'],['Arkansas', 'AR'],['California', 'CA'],['Colorado', 'CO'],['Connectict', 'CT'],['Delaware', 'DE'],['District of Columbia ', 'DC'],['Florida', 'FL'],['Georgia', 'GA'],['Hawaii', 'HI'],['Idaho', 'ID'],['Illinois', 'IL'],['Indiana', 'IN'],['Iowa', 'IA'],['Kansas', 'KS'],['Kentucky', 'KY'],['Louisiana', 'LA'],['Maine', 'ME'],['Maryland', 'MD'],['Massachusetts', 'MA'],['Michigan', 'MI'],['Minnesota', 'MN'],['Mississippi', 'MS'],['Missouri', 'MO'],['Montana', 'MT'],['Nebraska', 'NE'],['Nevada', 'NV'],['New Hampshire', 'NH'],['New Jersey', 'NJ'],['New Mexico', 'NM'],['New York', 'NY'],['North Carolina','NC'],['North Dakota', 'ND'],['Ohio', 'OH'],['Oklahoma', 'OK'],['Oregon', 'OR'],['Pennsylvania', 'PA'],['Rhode Island', 'RI'],['South Carolina', 'SC'],['South Dakota', 'SD'],['Tennessee', 'TN'],['Texas', 'TX'],['Utah', 'UT'],['Vermont', 'VT'],['Virginia', 'VA'],['Washington', 'WA'],['West Virginia', 'WV'],['Wisconsin ', 'WI'],['Wyoming', 'WY']]
  
  #validations
  validates_presence_of :first_name, :last_name, :password_digest, :street_1, :city, :state, :zip_code
  validates :username, presence: true, uniqueness: { case_sensitive: false }
  validates :role, inclusion: { in: role_array, message: "is not a valid role", allow_blank: false }
  validates :phone, format: {with: /\A(\d{10}|\(?\d{3}\)?[-. ]\d{3}[-.]\d{4})\z/, message: "should be 10 digits (area code needed) and delimited with dashes only", allow_blank: true }
  validates :email, format: {with: /\A[\w]([^@\s,;]+)@(([\w-]+\.)+(com|edu|org|net|gov|mil|biz|info))\z/i, :message => "is not a valid format", :allow_blank => false }
  validates :state, inclusion: { in: STATES_LIST.map{|a,b| b}, message: "is not valid state"}
  validates :zip_code, format: { with: /\A\d{5}\z/, message: "should be five digits long"}
  
  #scopes
  scope :alphabetical, -> { order('last_name, first_name') }
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  
  #callbacks
  before_validation :default_active
  before_validation :get_location_coordinates, :if => :street_1_changed?
  before_save :reformat_phone
  
  #methods
  def proper_name
    first_name + " " + last_name
  end
  
  def name
    last_name + ", " + first_name
  end
  
  # for use in authorizing with CanCan
  ROLES = [['Administrator', :admin], ['Business Owner', :business], ['Member', :member]]

  def self.authenticate(username,password)
    find_by_username(username).try(:authenticate, password)
  end

  def role?(authorized_role)
    return false if role.nil?
    role.downcase.to_sym == authorized_role
  end
  
  #location function needs to be reformatted for use of cell phone locator coordinates?
  def get_location_coordinates
    str = self.street_1
    zip = self.zip_code
    
    coord = Geocoder.coordinates("#{str}, #{zip}")
    if coord
      self.latitude = coord[0]
      self.longitude = coord[1]
    else 
      errors.add(:base, "Error with geocoding")
    end
    coord
  end
  
  private
  def default_active
    self.active = true if self.active.nil?
  end
  
  def reformat_phone
    self.phone = self.phone.to_s.gsub(/[^0-9]/,"")
  end
  
end
