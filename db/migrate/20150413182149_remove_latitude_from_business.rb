class RemoveLatitudeFromBusiness < ActiveRecord::Migration
  def change
    remove_column :businesses, :latitude, :string
  end
end
