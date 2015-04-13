class AddLatitudeToBusiness < ActiveRecord::Migration
  def change
    add_column :businesses, :latitude, :float
  end
end
