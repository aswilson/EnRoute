class CreateBusinessServices < ActiveRecord::Migration
  def change
    create_table :business_services do |t|
      t.integer :business_id
      t.integer :service_id
      t.boolean :active

      t.timestamps
    end
  end
end
