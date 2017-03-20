class CreateImages < ActiveRecord::Migration[5.0]
  def change
    create_table :images do |t|
      t.integer :user_id, null: false

      t.timestamps
    end
  end
end
