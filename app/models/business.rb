class Business < ActiveRecord::Base
  include EnRouteHelpers
  
  belongs_to :user
  has_many :business_services
  has_many :services, through: :business_services
  
  
  STATES_LIST = [['Alabama', 'AL'],['Alaska', 'AK'],['Arizona', 'AZ'],['Arkansas', 'AR'],['California', 'CA'],['Colorado', 'CO'],['Connectict', 'CT'],['Delaware', 'DE'],['District of Columbia ', 'DC'],['Florida', 'FL'],['Georgia', 'GA'],['Hawaii', 'HI'],['Idaho', 'ID'],['Illinois', 'IL'],['Indiana', 'IN'],['Iowa', 'IA'],['Kansas', 'KS'],['Kentucky', 'KY'],['Louisiana', 'LA'],['Maine', 'ME'],['Maryland', 'MD'],['Massachusetts', 'MA'],['Michigan', 'MI'],['Minnesota', 'MN'],['Mississippi', 'MS'],['Missouri', 'MO'],['Montana', 'MT'],['Nebraska', 'NE'],['Nevada', 'NV'],['New Hampshire', 'NH'],['New Jersey', 'NJ'],['New Mexico', 'NM'],['New York', 'NY'],['North Carolina','NC'],['North Dakota', 'ND'],['Ohio', 'OH'],['Oklahoma', 'OK'],['Oregon', 'OR'],['Pennsylvania', 'PA'],['Rhode Island', 'RI'],['South Carolina', 'SC'],['South Dakota', 'SD'],['Tennessee', 'TN'],['Texas', 'TX'],['Utah', 'UT'],['Vermont', 'VT'],['Virginia', 'VA'],['Washington', 'WA'],['West Virginia', 'WV'],['Wisconsin ', 'WI'],['Wyoming', 'WY']]
  
  #validations
  validate_presence_of :name, :street_1, :city
  validates :state, inclusion: { in: STATES_LIST.map{|a,b| b}, message: "is not valid state", allow_blank: false }
  validates :zip_code, presence: true, format: { with: /\A\d{5}\z/, message: "should be five digits long", allow_blank: false }
  validates_format_of :phone, with: /\A(\d{10}|\(?\d{3}\)?[-. ]\d{3}[-.]\d{4})\z/, message: "should be 10 digits (area code needed) and delimited with dashes only"
  
  #scopes
  scope :alphabetical, -> { order('name') }
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :by_service, -> (service_id) {joins(:business_service).where("service_id = ?". service_id)}
  
  #callbacks
  before_validation :get_location_coordinates
  before_validation :default_active
  before_save :reformat_phone
  
  def create_map_link(zoom=12,width=800,height=800)
    markers = "&markers=color:red%7Ccolor:red%7C#{self.latitude},#{self.longitude}"
    map = "http://maps.google.com/maps/api/staticmap?center= #{latitude},#{longitude}&zoom=13&size=800x800&maptype=roadmap#{markers}&sensor=false"
  end
   
  private
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
   
end
