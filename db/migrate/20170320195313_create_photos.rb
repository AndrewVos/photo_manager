class CreatePhotos < ActiveRecord::Migration[5.0]
  def change
    create_table :photos do |t|
      t.integer :user_id, null: false
      t.boolean :complete, null: false, default: false
      t.integer :size, null: false, default: 0
      t.string :content_type, null: false
      t.timestamps
    end
  end
end
