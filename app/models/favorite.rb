class Favorite < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :business
  
  STATES_LIST = [['Alabama', 'AL'],['Alaska', 'AK'],['Arizona', 'AZ'],['Arkansas', 'AR'],['California', 'CA'],['Colorado', 'CO'],['Connecticut', 'CT'],['Delaware', 'DE'],['District of Columbia ', 'DC'],['Florida', 'FL'],['Georgia', 'GA'],['Hawaii', 'HI'],['Idaho', 'ID'],['Illinois', 'IL'],['Indiana', 'IN'],['Iowa', 'IA'],['Kansas', 'KS'],['Kentucky', 'KY'],['Louisiana', 'LA'],['Maine', 'ME'],['Maryland', 'MD'],['Massachusetts', 'MA'],['Michigan', 'MI'],['Minnesota', 'MN'],['Mississippi', 'MS'],['Missouri', 'MO'],['Montana', 'MT'],['Nebraska', 'NE'],['Nevada', 'NV'],['New Hampshire', 'NH'],['New Jersey', 'NJ'],['New Mexico', 'NM'],['New York', 'NY'],['North Carolina','NC'],['North Dakota', 'ND'],['Ohio', 'OH'],['Oklahoma', 'OK'],['Oregon', 'OR'],['Pennsylvania', 'PA'],['Rhode Island', 'RI'],['South Carolina', 'SC'],['South Dakota', 'SD'],['Tennessee', 'TN'],['Texas', 'TX'],['Utah', 'UT'],['Vermont', 'VT'],['Virginia', 'VA'],['Washington', 'WA'],['West Virginia', 'WV'],['Wisconsin ', 'WI'],['Wyoming', 'WY']]
  
  CATEGORIES_LIST = ["blank", "restaurant", "atm", "coffee", "bank", "groceries", "pharmacy", "books", "work", "gas", "home", "post office"]
  
  validates_presence_of :name, :category, :user_id
  validates :state, inclusion: { in: STATES_LIST.map{|a,b| b}, message: "is not a valid state", allow_blank: true }
  validates :zip_code, format: { with: /\A\d{5}\z/, message: "should be five digits long", allow_blank: true }
  validates :category, inclusion: { in: CATEGORIES_LIST, message: "is not a valid category", allow_blank: false}
  validate :business_is_active_in_system
  validate :category_not_already_used, on: :create
  validate :not_already_a_favorite, on: :create
  validate :set_location_by_business, :if => :business_id_changed?
  
  scope :alphabetical, -> { order('name') }
  scope :for_user, -> (user_id) {where("user_id = ?", user_id)}
  scope :by_name, -> (name) {where("name = ?", name)}
  scope :by_category, -> (category) {where("category = ?", category)}
  
  after_validation :get_location_coordinates, :if => :street_1_changed?
 
  def already_exists?
    Favorite.where(user_id: self.user_id, business_id: self.business_id).size == 1
  end
    
  def not_already_a_favorite
    return true if self.user_id.nil? || self.business_id.nil?
    if self.already_exists?
      errors.add(:business_id, "this business is already favorited by this user")
    end
  end
  
  def category_not_already_used
    if Favorite.for_user(self.user_id).map(&:category).include?(self.category)
      return false
    else
      return true
    end
  end
  
  def set_location_by_business
    unless self.business_id.nil?
      bus = Business.find(self.business_id)
      self.street_1 = bus.street_1
      self.city = bus.city
      self.state = bus.state
      self.zip_code = bus.zip_code
      self.latitude = bus.latitude
      self.longitude = bus.longitude
    end
  end
  
  def get_location_coordinates
    unless self.street_1.nil?
      unless self.zip_code.nil?
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
  end
end

private

def business_is_active_in_system
  unless self.business_id.nil?
    is_active_in_system(:business)  
  end
end

def is_active_in_system(attribute)
  # This method tests to see if the value set for the attribute is
  # (a) in the system at all, and (b) is active, if the active flag
  # is applicable.  If that is not the case, it will add an error 
  # to stop validation process.
  
  # determine the class and id we need to work with
  klass = Object.const_get(attribute.to_s.capitalize)
  attr_id = "#{attribute.to_s}_id"
  
  # assuming the presence of the id is checked earlier, so return true 
  # if shoulda matchers are being used that might bypass that check
  return true if attr_id.nil?

  # determine the set of ids that might be valid
  if klass.respond_to?(:active)
    # if there is an active scope, take advantage of it
    all_active = klass.active.to_a.map{|k| k.id}
  else
    # if not, consider all the records as 'active'
    all_active = klass.to_a.map{|k| k.id}
  end

  # test to see if the id in question is in the set of valid ids 
  unless all_active.include?(self.send(attr_id))
    self.errors.add(attr_id.to_sym, "is not active in the system")
  end
end
