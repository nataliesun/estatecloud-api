ALTER TABLE estatecloud_properties
  DROP COLUMN IF EXISTS user_id;

DROP TABLE IF EXISTS estatecloud_users;
