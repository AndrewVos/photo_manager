class CreatePhotos < ActiveRecord::Migration[5.0]
  def change
    create_table :photos do |t|
      t.integer :user_id, null: false
      t.boolean :complete, null: false
      t.timestamps
    end
  end
end
