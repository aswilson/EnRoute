class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :first_name
      t.string :last_name
      t.string :username
      t.string :password_digest
      t.date :active_after
      t.string :password_reset_token
      t.date :password_reset_sent_at
      t.string :email
      t.string :phone
      t.string :latitute
      t.string :longitude
      t.string :role
      t.boolean :active

      t.timestamps
    end
  end
end
