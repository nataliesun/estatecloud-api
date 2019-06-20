CREATE TABLE estatecloud_properties (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL,
  rent_price INTEGER,
  initial_price INTEGER,
  mortgage_payment INTEGER,
  date_created TIMESTAMP DEFAULT now() NOT NULL
);
