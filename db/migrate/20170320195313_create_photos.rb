class CreatePhotos < ActiveRecord::Migration[5.0]
  def change
    create_table :photos do |t|
      t.integer :user_id, null: false
      t.string :thumbnail_url
      t.string :original_url

      t.timestamps
    end
  end
end
