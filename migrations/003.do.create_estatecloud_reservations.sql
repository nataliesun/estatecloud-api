CREATE TABLE estatecloud_reservations (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES estatecloud_properties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES estatecloud_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  all_day BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT now(),
  date_modified TIMESTAMP
);