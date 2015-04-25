class CreateFavorites < ActiveRecord::Migration
  def change
    create_table :favorites do |t|
      t.string :name
      t.string :street_1
      t.string :street_2
      t.string :city
      t.string :state
      t.string :zip_code
      t.float :latitude
      t.float :longitude
      t.string :type
      t.text :notes
      t.integer :user_id
      t.integer :business_id

      t.timestamps
    end
  end
end
