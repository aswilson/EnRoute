class AddStreet1ToUsers < ActiveRecord::Migration
  def change
    add_column :users, :street_1, :string
  end
end
