import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'devpulse_super_secret_jwt_key_123!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

export class AuthService {
  static async signup(userData: any) {
    const { name, email, password, role = 'contributor' } = userData;

    // Check if email already exists
    const emailCheckResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (emailCheckResult.rows.length > 0) {
      const error: any = new Error('Email is already registered');
      error.statusCode = 400; // Bad Request (duplicate resource)
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const insertResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role]
    );

    return insertResult.rows[0];
  }

  static async login(credentials: any) {
    const { email, password } = credentials;

    // Fetch user
    const result = await pool.query(
      'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // Generate JWT token containing id, name, role
    const payload = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }
}
export default AuthService;
