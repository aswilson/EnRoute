class AddCategoryToFavorites < ActiveRecord::Migration
  def change
    add_column :favorites, :category, :string
  end
end
