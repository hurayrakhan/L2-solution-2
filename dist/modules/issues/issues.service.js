"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuesService = void 0;
const db_1 = require("../../config/db");
const http_status_codes_1 = require("http-status-codes");
class IssuesService {
    static async createIssue(issueData, reporterId) {
        const { title, description, type } = issueData;
        const result = await db_1.pool.query(`INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`, [title, description, type, reporterId]);
        return result.rows[0];
    }
    static async getAllIssues(filters) {
        const { sort = 'newest', type, status } = filters;
        let query = 'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues';
        const conditions = [];
        const params = [];
        if (type) {
            params.push(type);
            conditions.push(`type = $${params.length}`);
        }
        if (status) {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        const sortOrder = sort === 'oldest' ? 'ASC' : 'DESC';
        query += ` ORDER BY created_at ${sortOrder}`;
        const result = await db_1.pool.query(query, params);
        const issues = result.rows;
        if (issues.length === 0) {
            return [];
        }
        // Fetch reporters without using SQL JOINs
        const reporterIds = Array.from(new Set(issues.map(issue => issue.reporter_id)));
        const usersResult = await db_1.pool.query('SELECT id, name, role FROM users WHERE id = ANY($1::int[])', [reporterIds]);
        const userMap = {};
        for (const user of usersResult.rows) {
            userMap[user.id] = user;
        }
        return issues.map(issue => {
            const { reporter_id, ...issueData } = issue;
            return {
                ...issueData,
                reporter: userMap[reporter_id] || { id: reporter_id, name: 'Unknown', role: 'contributor' }
            };
        });
    }
    static async getIssueById(id) {
        const issueResult = await db_1.pool.query('SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1', [id]);
        if (issueResult.rows.length === 0) {
            const error = new Error('Issue not found');
            error.statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
            throw error;
        }
        const issue = issueResult.rows[0];
        // Fetch reporter details
        const userResult = await db_1.pool.query('SELECT id, name, role FROM users WHERE id = $1', [issue.reporter_id]);
        const reporter = userResult.rows[0] || { id: issue.reporter_id, name: 'Unknown', role: 'contributor' };
        const { reporter_id, ...issueData } = issue;
        return {
            ...issueData,
            reporter
        };
    }
    static async updateIssue(id, updateData, user) {
        // 1. Fetch the issue first
        const issueResult = await db_1.pool.query('SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1', [id]);
        if (issueResult.rows.length === 0) {
            const error = new Error('Issue not found');
            error.statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
            throw error;
        }
        const issue = issueResult.rows[0];
        // 2. Access control check
        if (user.role === 'contributor') {
            // Must be the owner
            if (issue.reporter_id !== user.id) {
                const error = new Error('Access denied: You can only update your own issues');
                error.statusCode = http_status_codes_1.StatusCodes.FORBIDDEN;
                throw error;
            }
            // Can only edit if status is 'open'
            if (issue.status !== 'open') {
                const error = new Error('Conflict: Cannot update issue since status is not open');
                error.statusCode = http_status_codes_1.StatusCodes.CONFLICT;
                throw error;
            }
            // Cannot update status
            if (updateData.status !== undefined && updateData.status !== issue.status) {
                const error = new Error('Forbidden: Contributors cannot change issue status');
                error.statusCode = http_status_codes_1.StatusCodes.FORBIDDEN;
                throw error;
            }
        }
        // 3. Build update query
        const fields = [];
        const params = [];
        const { title, description, type, status } = updateData;
        if (title !== undefined) {
            params.push(title);
            fields.push(`title = $${params.length}`);
        }
        if (description !== undefined) {
            params.push(description);
            fields.push(`description = $${params.length}`);
        }
        if (type !== undefined) {
            params.push(type);
            fields.push(`type = $${params.length}`);
        }
        if (status !== undefined) {
            params.push(status);
            fields.push(`status = $${params.length}`);
        }
        if (fields.length === 0) {
            // Nothing to update, return the current issue
            return issue;
        }
        // Always update updated_at
        fields.push('updated_at = NOW()');
        params.push(id);
        const query = `UPDATE issues SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`;
        const updateResult = await db_1.pool.query(query, params);
        return updateResult.rows[0];
    }
    static async deleteIssue(id) {
        // 1. Fetch the issue first
        const issueResult = await db_1.pool.query('SELECT id FROM issues WHERE id = $1', [id]);
        if (issueResult.rows.length === 0) {
            const error = new Error('Issue not found');
            error.statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
            throw error;
        }
        // 2. Perform delete
        await db_1.pool.query('DELETE FROM issues WHERE id = $1', [id]);
    }
}
exports.IssuesService = IssuesService;
exports.default = IssuesService;
