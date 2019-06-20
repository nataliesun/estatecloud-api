BEGIN;

  TRUNCATE
  estatecloud_properties,
  estatecloud_users
  RESTART IDENTITY CASCADE;

  INSERT INTO estatecloud_users
    (email, first_name, last_name, password)
  VALUES
    ('natalie@gmail.com', 'Natalie', 'Sun', '$2a$12$pWdyP7b8QT0lifixOq46/OnqU0rkIGN40W1SGU/Vtg227p/um5xvC'),
    ('boop@gmail.com', 'Boop', 'Bop', '$2a$12$SCfOuxmu/ojGGYEBYI3ffuiL7c3wcEKsUr0XFJI0HFJtyI4AjmysG');

  INSERT INTO estatecloud_properties
    (address, city, state, status, rent_price, initial_price, mortgage_payment, user_id)
  VALUES
    ('543 Watermelon Ave', 'Torrance', 'CA', 'occupied', 0, 100000, 0, 1),
    ('23 Meep St', 'Redondo Beach', 'CA', 'rented', 1500, 1000000, 1000, 1),
    ('543 Watermelon Ave', 'Torrance', 'CA', 'available', 0, 100000, 1200, 1);

  COMMIT;
