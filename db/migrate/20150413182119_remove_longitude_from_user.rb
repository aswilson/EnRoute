class RemoveLongitudeFromUser < ActiveRecord::Migration
  def change
    remove_column :users, :longitude, :string
  end
end
