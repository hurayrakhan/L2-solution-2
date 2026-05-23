import app from '../app';
import { pool } from '../config/db';

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('--- STARTING INTEGRATION TESTS ---');

  // Start Express Server
  const server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);
    try {
      // 1. Clean Database
      console.log('Truncating tables...');
      await pool.query('TRUNCATE TABLE issues, users RESTART IDENTITY CASCADE;');

      // 2. Test Signup
      console.log('\n[1] Testing User Registration (Signup)...');
      
      // Signup contributor
      const resSignupContr = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Contributor John',
          email: 'john.contr@devpulse.com',
          password: 'password123',
          role: 'contributor'
        })
      });
      const dataSignupContr = await resSignupContr.json() as any;
      assert(resSignupContr.status === 201, `Expected 201, got ${resSignupContr.status}`);
      assert(dataSignupContr.success === true, 'Expected success to be true');
      assert(dataSignupContr.data.role === 'contributor', 'Expected role to be contributor');
      assert(dataSignupContr.data.password === undefined, 'Password must not be returned');
      console.log('✓ Contributor signup success');

      // Signup maintainer
      const resSignupMaint = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Maintainer Jane',
          email: 'jane.maint@devpulse.com',
          password: 'password123',
          role: 'maintainer'
        })
      });
      const dataSignupMaint = await resSignupMaint.json() as any;
      assert(resSignupMaint.status === 201, `Expected 201, got ${resSignupMaint.status}`);
      assert(dataSignupMaint.data.role === 'maintainer', 'Expected role to be maintainer');
      console.log('✓ Maintainer signup success');

      // Signup duplicate email
      const resSignupDup = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate John',
          email: 'john.contr@devpulse.com',
          password: 'password123',
          role: 'contributor'
        })
      });
      assert(resSignupDup.status === 400, `Expected 400 for duplicate email, got ${resSignupDup.status}`);
      console.log('✓ Duplicate email rejection success');

      // 3. Test Login
      console.log('\n[2] Testing User Login...');
      const resLoginContr = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'john.contr@devpulse.com',
          password: 'password123'
        })
      });
      const dataLoginContr = await resLoginContr.json() as any;
      assert(resLoginContr.status === 200, `Expected 200, got ${resLoginContr.status}`);
      assert(dataLoginContr.data.token !== undefined, 'Expected token to be returned');
      const contrToken = dataLoginContr.data.token;
      console.log('✓ Contributor login success');

      const resLoginMaint = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'jane.maint@devpulse.com',
          password: 'password123'
        })
      });
      const dataLoginMaint = await resLoginMaint.json() as any;
      const maintToken = dataLoginMaint.data.token;
      console.log('✓ Maintainer login success');

      // 4. Test Create Issue
      console.log('\n[3] Testing Issue Creation...');
      
      // Contributor creates bug
      const resCreateBug = await fetch(`${BASE_URL}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': contrToken
        },
        body: JSON.stringify({
          title: 'Database connection timeout under load',
          description: 'Pool exhausts after 50+ concurrent queries, causing 500 errors',
          type: 'bug'
        })
      });
      const dataCreateBug = await resCreateBug.json() as any;
      assert(resCreateBug.status === 201, `Expected 201, got ${resCreateBug.status}`);
      assert(dataCreateBug.data.reporter_id === dataLoginContr.data.user.id, 'Reporter ID must match logged in user');
      assert(dataCreateBug.data.status === 'open', 'Default status must be open');
      const bugId = dataCreateBug.data.id;
      console.log(`✓ Bug creation success (ID: ${bugId})`);

      // Contributor creates feature request
      const resCreateFeat = await fetch(`${BASE_URL}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': contrToken
        },
        body: JSON.stringify({
          title: 'Add dark mode theme support',
          description: 'Users want a dark mode for night usage on all pages',
          type: 'feature_request'
        })
      });
      const dataCreateFeat = await resCreateFeat.json() as any;
      assert(resCreateFeat.status === 201, `Expected 201, got ${resCreateFeat.status}`);
      const featId = dataCreateFeat.data.id;
      console.log(`✓ Feature request creation success (ID: ${featId})`);

      // Validation failure (description too short)
      const resCreateShortDesc = await fetch(`${BASE_URL}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': contrToken
        },
        body: JSON.stringify({
          title: 'Short description bug',
          description: 'Too short',
          type: 'bug'
        })
      });
      assert(resCreateShortDesc.status === 400, `Expected 400 for short description, got ${resCreateShortDesc.status}`);
      console.log('✓ Validation failure (short description) rejection success');

      // 5. Test Get Issues
      console.log('\n[4] Testing Issue Retrieval...');
      
      // Get all issues (public)
      const resGetIssues = await fetch(`${BASE_URL}/issues`);
      const dataGetIssues = await resGetIssues.json() as any;
      assert(resGetIssues.status === 200, `Expected 200, got ${resGetIssues.status}`);
      assert(dataGetIssues.message === 'Issues retrived successfully', `Expected spelling "Issues retrived successfully", got "${dataGetIssues.message}"`);
      assert(dataGetIssues.data.length >= 2, 'Should return at least 2 issues');
      assert(dataGetIssues.data[0].reporter.name === 'Contributor John', 'Reporter should be populated');
      assert(dataGetIssues.data[0].reporter.password === undefined, 'Reporter password must not be returned');
      console.log('✓ Public get all issues success');

      // Get single issue
      const resGetSingle = await fetch(`${BASE_URL}/issues/${bugId}`);
      const dataGetSingle = await resGetSingle.json() as any;
      assert(resGetSingle.status === 200, `Expected 200, got ${resGetSingle.status}`);
      assert(dataGetSingle.message === 'Issue retrived successfully', `Expected spelling "Issue retrived successfully", got "${dataGetSingle.message}"`);
      assert(dataGetSingle.data.reporter.name === 'Contributor John', 'Reporter should be populated');
      console.log('✓ Public get single issue success');

      // 6. Test Update Issue (PATCH)
      console.log('\n[5] Testing Issue Updating...');

      // Contributor updates own issue
      const resUpdateOwn = await fetch(`${BASE_URL}/issues/${bugId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': contrToken
        },
        body: JSON.stringify({
          title: 'Updated: Database pool exhaustion fix needed',
          description: 'Updated description with reproduction steps...',
          type: 'bug'
        })
      });
      const dataUpdateOwn = await resUpdateOwn.json() as any;
      assert(resUpdateOwn.status === 200, `Expected 200, got ${resUpdateOwn.status}`);
      assert(dataUpdateOwn.data.title === 'Updated: Database pool exhaustion fix needed', 'Title should be updated');
      console.log('✓ Contributor update own issue success');

      // Contributor tries to update status (should fail 403)
      const resUpdateStatusContr = await fetch(`${BASE_URL}/issues/${bugId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': contrToken
        },
        body: JSON.stringify({
          status: 'resolved'
        })
      });
      assert(resUpdateStatusContr.status === 403, `Expected 403 for status change, got ${resUpdateStatusContr.status}`);
      console.log('✓ Contributor status update block success');

      // Maintainer updates status of issue
      const resUpdateStatusMaint = await fetch(`${BASE_URL}/issues/${bugId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': maintToken
        },
        body: JSON.stringify({
          status: 'in_progress'
        })
      });
      const dataUpdateStatusMaint = await resUpdateStatusMaint.json() as any;
      assert(resUpdateStatusMaint.status === 200, `Expected 200, got ${resUpdateStatusMaint.status}`);
      assert(dataUpdateStatusMaint.data.status === 'in_progress', 'Status should be in_progress');
      console.log('✓ Maintainer status update success');

      // Contributor tries to update when status is not open (should fail 409 Conflict)
      const resUpdateNonOpenContr = await fetch(`${BASE_URL}/issues/${bugId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': contrToken
        },
        body: JSON.stringify({
          title: 'Trying to update in-progress issue'
        })
      });
      assert(resUpdateNonOpenContr.status === 409, `Expected 409 for editing non-open issue, got ${resUpdateNonOpenContr.status}`);
      console.log('✓ Contributor block on non-open issue edit success');

      // 7. Test Delete Issue
      console.log('\n[6] Testing Issue Deletion...');

      // Contributor tries to delete (should fail 403)
      const resDeleteContr = await fetch(`${BASE_URL}/issues/${featId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': contrToken
        }
      });
      assert(resDeleteContr.status === 403, `Expected 403, got ${resDeleteContr.status}`);
      console.log('✓ Contributor delete block success');

      // Maintainer deletes issue
      const resDeleteMaint = await fetch(`${BASE_URL}/issues/${featId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': maintToken
        }
      });
      const dataDeleteMaint = await resDeleteMaint.json() as any;
      assert(resDeleteMaint.status === 200, `Expected 200, got ${resDeleteMaint.status}`);
      assert(dataDeleteMaint.message === 'Issue deleted successfully', 'Expected success message');
      console.log('✓ Maintainer delete issue success');

      // Verify deletion from get all
      const resGetAfterDelete = await fetch(`${BASE_URL}/issues`);
      const dataGetAfterDelete = await resGetAfterDelete.json() as any;
      assert(dataGetAfterDelete.data.length === 1, `Expected 1 issue left, got ${dataGetAfterDelete.data.length}`);
      assert(dataGetAfterDelete.data[0].id === bugId, 'Remaining issue should be the bug report');
      console.log('✓ Deletion verification success');

      console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    } catch (err) {
      console.error('\n❌ TEST RUN FAILURE:', err);
      process.exitCode = 1;
    } finally {
      server.close(() => {
        console.log('Test server closed.');
        pool.end().then(() => {
          console.log('Database connection pool closed.');
          process.exit();
        });
      });
    }
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

runTests();
