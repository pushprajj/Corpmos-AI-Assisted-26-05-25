import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'connect_sphere',
  password: 'Creator!2', // Replace with your actual password, if set
  port: 5432,
});

export default pool;