class RemoveTypeFromFavorites < ActiveRecord::Migration
  def change
    remove_column :favorites, :type, :string
  end
end
