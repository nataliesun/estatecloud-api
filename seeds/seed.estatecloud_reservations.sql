BEGIN;

  TRUNCATE
  estatecloud_reservations
  RESTART IDENTITY CASCADE;

  INSERT INTO estatecloud_reservations
    (property_id, user_id, title, start_date, end_date)
  VALUES
    (15, 3, 'meepkats', '2019-06-20 04:05:06-07' , '2019-06-20 04:05:06-07'),
    (15, 3, 'schmoop', '2019-06-18 04:05:06-07' , '2019-06-19 04:05:06-07'),
    (15, 3, 'blop', '2019-06-10 04:05:06-07', '2019-06-12 04:05:06-07');

  COMMIT;
