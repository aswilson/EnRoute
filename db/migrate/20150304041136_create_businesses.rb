class CreateBusinesses < ActiveRecord::Migration
  def change
    create_table :businesses do |t|
      t.string :name
      t.text :description
      t.string :phone
      t.string :schedule
      t.string :street_1
      t.string :street_2
      t.string :city
      t.string :state
      t.string :zip_code
      t.string :latitude
      t.string :longitude
      t.float :rating
      t.integer :number_of_raters
      t.integer :user_id
      t.boolean :active

      t.timestamps
    end
  end
end
