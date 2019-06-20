BEGIN;

  TRUNCATE
  estatecloud_properties
  RESTART IDENTITY CASCADE;


  INSERT INTO estatecloud_properties
    (address, city, state, status, rent_price, initial_price, mortgage_payment, user_id)
  VALUES
    ('543 Watermelon Ave', 'Torrance', 'CA', 'occupied', 0, 100000, 0, 1),
    ('23 Meep St', 'Redondo Beach', 'CA', 'rented', 1500, 1000000, 1000, 1),
    ('234 Jeep Ave', 'San Diego', 'CA', 'available', 0, 100000, 1200, 3),
    ('234 Sql Ave', 'San Diego', 'CA', 'rented', 1500, 150000, 1200, 3);

  COMMIT;
