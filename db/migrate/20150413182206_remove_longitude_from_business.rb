class RemoveLongitudeFromBusiness < ActiveRecord::Migration
  def change
    remove_column :businesses, :longitude, :string
  end
end
