module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL:
    process.env.DATABASE_URL ||
    'postgresql://estatecloud@localhost:5432/estatecloud',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:8000/api",
  CLIENT_ORIGIN: 'http://localhost:3000'
};
