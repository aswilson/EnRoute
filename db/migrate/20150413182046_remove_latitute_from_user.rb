class RemoveLatituteFromUser < ActiveRecord::Migration
  def change
    remove_column :users, :latitute, :string
  end
end
