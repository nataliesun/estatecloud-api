CREATE TABLE estatecloud_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  password TEXT NOT NULL,
  last_name TEXT,
  date_created TIMESTAMP NOT NULL DEFAULT now(),
  date_modified TIMESTAMP
);

ALTER TABLE estatecloud_properties
  ADD COLUMN
    user_id INTEGER REFERENCES estatecloud_users(id)
    ON DELETE SET NULL;
