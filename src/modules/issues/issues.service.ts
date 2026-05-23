import { pool } from '../../config/db';
import { StatusCodes } from 'http-status-codes';

export class IssuesService {
  static async createIssue(issueData: any, reporterId: number) {
    const { title, description, type } = issueData;

    const result = await pool.query(
      `INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
      [title, description, type, reporterId]
    );

    return result.rows[0];
  }

  static async getAllIssues(filters: { sort?: string; type?: string; status?: string }) {
    const { sort = 'newest', type, status } = filters;

    let query = 'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues';
    const conditions: string[] = [];
    const params: any[] = [];

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

    const result = await pool.query(query, params);
    const issues = result.rows;

    if (issues.length === 0) {
      return [];
    }

    // Fetch reporters without using SQL JOINs
    const reporterIds = Array.from(new Set(issues.map(issue => issue.reporter_id)));
    const usersResult = await pool.query(
      'SELECT id, name, role FROM users WHERE id = ANY($1::int[])',
      [reporterIds]
    );

    const userMap: Record<number, { id: number; name: string; role: string }> = {};
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

  static async getIssueById(id: number) {
    const issueResult = await pool.query(
      'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1',
      [id]
    );

    if (issueResult.rows.length === 0) {
      const error: any = new Error('Issue not found');
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    const issue = issueResult.rows[0];

    // Fetch reporter details
    const userResult = await pool.query(
      'SELECT id, name, role FROM users WHERE id = $1',
      [issue.reporter_id]
    );

    const reporter = userResult.rows[0] || { id: issue.reporter_id, name: 'Unknown', role: 'contributor' };

    const { reporter_id, ...issueData } = issue;

    return {
      ...issueData,
      reporter
    };
  }

  static async updateIssue(id: number, updateData: any, user: { id: number; role: string }) {
    // 1. Fetch the issue first
    const issueResult = await pool.query(
      'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1',
      [id]
    );

    if (issueResult.rows.length === 0) {
      const error: any = new Error('Issue not found');
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    const issue = issueResult.rows[0];

    // 2. Access control check
    if (user.role === 'contributor') {
      // Must be the owner
      if (issue.reporter_id !== user.id) {
        const error: any = new Error('Access denied: You can only update your own issues');
        error.statusCode = StatusCodes.FORBIDDEN;
        throw error;
      }

      // Can only edit if status is 'open'
      if (issue.status !== 'open') {
        const error: any = new Error('Conflict: Cannot update issue since status is not open');
        error.statusCode = StatusCodes.CONFLICT;
        throw error;
      }

      // Cannot update status
      if (updateData.status !== undefined && updateData.status !== issue.status) {
        const error: any = new Error('Forbidden: Contributors cannot change issue status');
        error.statusCode = StatusCodes.FORBIDDEN;
        throw error;
      }
    }

    // 3. Build update query
    const fields: string[] = [];
    const params: any[] = [];

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
    const updateResult = await pool.query(query, params);

    return updateResult.rows[0];
  }

  static async deleteIssue(id: number) {
    // 1. Fetch the issue first
    const issueResult = await pool.query(
      'SELECT id FROM issues WHERE id = $1',
      [id]
    );

    if (issueResult.rows.length === 0) {
      const error: any = new Error('Issue not found');
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    // 2. Perform delete
    await pool.query('DELETE FROM issues WHERE id = $1', [id]);
  }
}
export default IssuesService;
