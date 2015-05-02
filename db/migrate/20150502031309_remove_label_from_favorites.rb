class RemoveLabelFromFavorites < ActiveRecord::Migration
  def change
    remove_column :favorites, :label, :string
  end
end
