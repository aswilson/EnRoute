class AddStreet2ToUsers < ActiveRecord::Migration
  def change
    add_column :users, :street_2, :string
  end
end
