"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is missing!');
}
exports.pool = new pg_1.Pool({
    connectionString: databaseUrl,
});
exports.pool.on('connect', () => {
    console.log('Database pool connected successfully');
});
exports.pool.on('error', (err) => {
    console.error('Unexpected database error on idle client', err);
});
