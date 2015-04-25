class Favorite < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :business
  
  STATES_LIST = [['Alabama', 'AL'],['Alaska', 'AK'],['Arizona', 'AZ'],['Arkansas', 'AR'],['California', 'CA'],['Colorado', 'CO'],['Connectict', 'CT'],['Delaware', 'DE'],['District of Columbia ', 'DC'],['Florida', 'FL'],['Georgia', 'GA'],['Hawaii', 'HI'],['Idaho', 'ID'],['Illinois', 'IL'],['Indiana', 'IN'],['Iowa', 'IA'],['Kansas', 'KS'],['Kentucky', 'KY'],['Louisiana', 'LA'],['Maine', 'ME'],['Maryland', 'MD'],['Massachusetts', 'MA'],['Michigan', 'MI'],['Minnesota', 'MN'],['Mississippi', 'MS'],['Missouri', 'MO'],['Montana', 'MT'],['Nebraska', 'NE'],['Nevada', 'NV'],['New Hampshire', 'NH'],['New Jersey', 'NJ'],['New Mexico', 'NM'],['New York', 'NY'],['North Carolina','NC'],['North Dakota', 'ND'],['Ohio', 'OH'],['Oklahoma', 'OK'],['Oregon', 'OR'],['Pennsylvania', 'PA'],['Rhode Island', 'RI'],['South Carolina', 'SC'],['South Dakota', 'SD'],['Tennessee', 'TN'],['Texas', 'TX'],['Utah', 'UT'],['Vermont', 'VT'],['Virginia', 'VA'],['Washington', 'WA'],['West Virginia', 'WV'],['Wisconsin ', 'WI'],['Wyoming', 'WY']]
  
  TYPES_LIST = ["home", "work", "pharmacy", "bank", "other"]
  
  validates_presence_of :name, :type
  validates :state, inclusion: { in: STATES_LIST.map{|a,b| b}, message: "is not valid state", allow_blank: true }
  validates :zip_code, format: { with: /\A\d{5}\z/, message: "should be five digits long", allow_blank: true }
  
  before_validation :get_location_coordinates
  
  #fill in address if business_id chosen and let be blank otherwise???
  
  def get_location_coordinates
    if self.street_1 IS NOT NULL
      if self.zip_code IS NOT NULL
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
