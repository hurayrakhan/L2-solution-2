"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../config/db");
const JWT_SECRET = process.env.JWT_SECRET || 'devpulse_super_secret_jwt_key_123!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;
class AuthService {
    static async signup(userData) {
        const { name, email, password, role = 'contributor' } = userData;
        // Check if email already exists
        const emailCheckResult = await db_1.pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheckResult.rows.length > 0) {
            const error = new Error('Email is already registered');
            error.statusCode = 400; // Bad Request (duplicate resource)
            throw error;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Insert user
        const insertResult = await db_1.pool.query(`INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`, [name, email, hashedPassword, role]);
        return insertResult.rows[0];
    }
    static async login(credentials) {
        const { email, password } = credentials;
        // Fetch user
        const result = await db_1.pool.query('SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401; // Unauthorized
            throw error;
        }
        const user = result.rows[0];
        // Check password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401; // Unauthorized
            throw error;
        }
        // Generate JWT token containing id, name, role
        const payload = {
            id: user.id,
            name: user.name,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;
        return {
            token,
            user: userWithoutPassword,
        };
    }
}
exports.AuthService = AuthService;
exports.default = AuthService;
