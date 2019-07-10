module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL:
    process.env.DATABASE_URL ||
    'postgresql://estatecloud@localhost:5432/estatecloud',
  JWT_SECRET: process.env.JWT_SECRET || 'my-own-special-jwt-secret',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:8000/api",
  CLIENT_ORIGIN: 'http://localhost:3000',
  API_KEY: process.env.API_KEY || 'e1a4997a-e314-49cc-93c6-967f4ca8f687'
};
