// tests/phase2_features.test.mjs
// Comprehensive Automated Test Suite for Phase 2: Shared Checklist, Decisions, and Budget
// Run: node tests/phase2_features.test.mjs

import assert from 'node:assert/strict';
import { createApiServer } from '../server/server.js';
import { resetDatabase } from '../server/db.js';

console.log('====================================================');
console.log('📋 RUNNING PHASE 2: CHECKLIST, DECISIONS & BUDGET TESTS');
console.log('====================================================\n');

let server;
let baseUrl;
let passed = 0;
let failed = 0;

function logPass(msg) {
  passed++;
  console.log(`  ✅ PASS: ${msg}`);
}

function logFail(msg, err) {
  failed++;
  console.error(`  ❌ FAIL: ${msg}`);
  console.error(err);
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const body = options.body ? JSON.stringify(options.body) : undefined;

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  resetDatabase();

  server = createApiServer();
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // SETUP: Workspace and Users (Groom, Bride, Planner, Friend, Vendor)
    // -------------------------------------------------------------
    // Register Groom
    const groomReg = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Juma Groom', email: 'juma.groom@example.com', password: 'password123', role: 'customer' }
    });
    const groomToken = groomReg.data.token;
    const groomId = groomReg.data.user.id;

    // Register Bride
    const brideReg = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Amina Bride', email: 'amina.bride@example.com', password: 'password123', role: 'customer' }
    });
    const brideToken = brideReg.data.token;
    const brideId = brideReg.data.user.id;

    // Register Planner
    const plannerReg = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Zainab Planner', email: 'zainab.planner@example.com', password: 'password123', role: 'customer' }
    });
    const plannerToken = plannerReg.data.token;
    const plannerId = plannerReg.data.user.id;

    // Register Friend
    const friendReg = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Baraka Bestman', email: 'baraka.friend@example.com', password: 'password123', role: 'customer' }
    });
    const friendToken = friendReg.data.token;
    const friendId = friendReg.data.user.id;

    // Register Vendor
    const vendorReg = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Serena Caterer', email: 'serena.vendor@example.com', password: 'password123', role: 'vendor' }
    });
    const vendorToken = vendorReg.data.token;
    const vendorId = vendorReg.data.user.id;

    // Groom creates Wedding Workspace
    const wsRes = await request('/api/workspaces', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: {
        title: 'Juma & Amina Grand Royal Wedding',
        date: '2026-11-20',
        location: 'Dar es Salaam',
        budget: 20000000,
        guests: 250
      }
    });
    const workspaceId = wsRes.data.workspace.id;

    // Groom invites Bride as partner
    const invBride = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { role: 'partner' }
    });
    await request(`/api/invitations/${invBride.data.invitation.token}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${brideToken}` }
    });

    // Groom invites Planner as planner
    const invPlanner = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { role: 'planner' }
    });
    await request(`/api/invitations/${invPlanner.data.invitation.token}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${plannerToken}` }
    });

    // Groom invites Friend as friend
    const invFriend = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { role: 'friend' }
    });
    await request(`/api/invitations/${invFriend.data.invitation.token}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${friendToken}` }
    });

    // Groom invites Vendor as vendor
    const invVendor = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { role: 'vendor' }
    });
    await request(`/api/invitations/${invVendor.data.invitation.token}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${vendorToken}` }
    });

    // =============================================================
    // SECTION 1: SHARED CHECKLIST & TASK MANAGEMENT
    // =============================================================
    console.log('--- 1. Shared Checklist & Task Management ---');

    // 1.1 Groom creates task with future due date
    const t1Res = await request(`/api/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: {
        title: 'Book Serena Hotel Ballroom',
        description: 'Review contract terms, capacity, and deposit requirements',
        assigneeId: brideId,
        dueDate: '2026-11-10',
        priority: 'high'
      }
    });

    assert.equal(t1Res.status, 201);
    assert.equal(t1Res.data.task.title, 'Book Serena Hotel Ballroom');
    assert.equal(t1Res.data.task.status, 'pending');
    assert.equal(t1Res.data.task.version, 1);
    assert.equal(t1Res.data.task.assigneeId, brideId);
    assert.ok(t1Res.data.task.activityHistory.length > 0);
    logPass('Owner creates task with assignee and future due date (evaluates to pending)');

    const task1Id = t1Res.data.task.id;

    // 1.2 Bride receives automatic assignment notification
    const brideNotifs = await request(`/api/workspaces/${workspaceId}/notifications`, {
      headers: { Authorization: `Bearer ${brideToken}` }
    });
    assert.ok(brideNotifs.data.notifications.some(n => n.type === 'task_assigned' && n.entityId === task1Id));
    logPass('Assignee automatically receives task_assigned notification');

    // 1.3 Create task with past due date -> dynamically evaluates to overdue
    const tOverdueRes = await request(`/api/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: {
        title: 'Early Bird Cake Tasting',
        description: 'Should have happened yesterday',
        assigneeId: groomId,
        dueDate: '2026-10-01', // Past date
        priority: 'medium'
      }
    });

    assert.equal(tOverdueRes.status, 201);
    assert.equal(tOverdueRes.data.task.status, 'overdue');
    logPass('Task with past due date dynamically evaluates to overdue in Africa/Dar_es_Salaam');

    // 1.4 Post comments on task
    const commentRes = await request(`/api/workspaces/${workspaceId}/tasks/${task1Id}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${brideToken}` },
      body: { text: 'Spoke to the manager, venue includes sound system and 250 chairs.' }
    });

    assert.equal(commentRes.status, 201);
    assert.equal(commentRes.data.comment.userName, 'Amina Bride');
    assert.equal(commentRes.data.comment.text, 'Spoke to the manager, venue includes sound system and 250 chairs.');
    logPass('Member posts comment to task thread with author attribution');

    // 1.5 Assignee completes task -> status updates, version increments, history records completion
    const completeRes = await request(`/api/workspaces/${workspaceId}/tasks/${task1Id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${brideToken}` },
      body: { status: 'completed' }
    });

    assert.equal(completeRes.status, 200);
    assert.equal(completeRes.data.task.status, 'completed');
    assert.equal(completeRes.data.task.version, 2);
    assert.ok(completeRes.data.task.activityHistory.some(h => h.action === 'status_changed'));
    logPass('Assignee completes task; version increments and activity history is logged');

    // 1.6 Non-assignee without task management cannot edit or complete other members tasks
    const unauthEditRes = await request(`/api/workspaces/${workspaceId}/tasks/${tOverdueRes.data.task.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${friendToken}` },
      body: { status: 'completed' }
    });

    assert.equal(unauthEditRes.status, 403);
    logPass('Non-assignee member without manage permission cannot complete others tasks (403 Forbidden)');

    // 1.7 Friend cannot create task (lacks canManageTasks permission)
    const friendCreateRes = await request(`/api/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${friendToken}` },
      body: { title: 'Unauthorized Task', priority: 'low' }
    });

    assert.equal(friendCreateRes.status, 403);
    logPass('Friend role cannot create tasks (role permissions strictly enforced)');

    // 1.8 Planner (has canManageTasks) deletes overdue task
    const delTaskRes = await request(`/api/workspaces/${workspaceId}/tasks/${tOverdueRes.data.task.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${plannerToken}` }
    });

    assert.equal(delTaskRes.status, 200);
    logPass('Planner successfully deletes task using authorized management permission');

    // =============================================================
    // SECTION 2: SHARED DECISIONS & VOTING POLLS
    // =============================================================
    console.log('\n--- 2. Shared Decisions & Collaborative Voting ---');

    // 2.1 Planner creates decision poll with multiple options
    const decRes = await request(`/api/workspaces/${workspaceId}/decisions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${plannerToken}` },
      body: {
        title: 'Wedding Cake Flavors',
        description: 'Choose between 3-tier passionfruit vanilla or red velvet sponge',
        category: 'catering',
        options: [
          'Passionfruit Vanilla Swirl',
          'Rich Red Velvet Cream Cheese',
          'Tanzanian Spiced Chocolate'
        ]
      }
    });

    assert.equal(decRes.status, 201);
    assert.equal(decRes.data.decision.title, 'Wedding Cake Flavors');
    assert.equal(decRes.data.decision.status, 'open');
    assert.equal(decRes.data.decision.options.length, 3);
    const decisionId = decRes.data.decision.id;
    const opt0Id = decRes.data.decision.options[0].id;
    const opt1Id = decRes.data.decision.options[1].id;
    logPass('Planner launches multi-option collaborative decision poll');

    // 2.2 Groom votes for option 0
    const vote1 = await request(`/api/workspaces/${workspaceId}/decisions/${decisionId}/vote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { optionId: opt0Id }
    });

    assert.equal(vote1.status, 200);
    assert.equal(vote1.data.decision.options[0].votes.length, 1);
    logPass('Groom votes for Option 1; tally updates immediately');

    // 2.3 Bride votes for option 1
    const vote2 = await request(`/api/workspaces/${workspaceId}/decisions/${decisionId}/vote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${brideToken}` },
      body: { optionId: opt1Id }
    });

    assert.equal(vote2.status, 200);
    assert.equal(vote2.data.decision.options[1].votes.length, 1);
    logPass('Bride votes for Option 2; tallies tracked per user');

    // 2.4 Groom changes vote to option 1
    const voteChange = await request(`/api/workspaces/${workspaceId}/decisions/${decisionId}/vote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { optionId: opt1Id }
    });

    assert.equal(voteChange.status, 200);
    assert.equal(voteChange.data.decision.options[0].votes.length, 0);
    assert.equal(voteChange.data.decision.options[1].votes.length, 2);
    logPass('User switches vote; previous option vote decrements and new option increments');

    // 2.5 Bride (Partner) finalizes decision consensus as 'agreed'
    const finalizeRes = await request(`/api/workspaces/${workspaceId}/decisions/${decisionId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${brideToken}` },
      body: {
        status: 'agreed',
        decisionNotes: 'Unanimous preference for Red Velvet with bakery confirmation'
      }
    });

    assert.equal(finalizeRes.status, 200);
    assert.equal(finalizeRes.data.decision.status, 'agreed');
    assert.equal(finalizeRes.data.decision.decidedBy, 'Amina Bride');
    logPass('Partner finalizes consensus with decision notes and author tracking');

    // 2.6 Voting on finalized decision is rejected
    const voteClosed = await request(`/api/workspaces/${workspaceId}/decisions/${decisionId}/vote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${plannerToken}` },
      body: { optionId: opt0Id }
    });
    assert.equal(voteClosed.status, 400);
    logPass('Voting blocked on closed/finalized decision poll');

    // 2.7 Create shared notes (pinned and unpinned)
    const noteRes = await request(`/api/workspaces/${workspaceId}/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${plannerToken}` },
      body: {
        title: 'Emergency Medical & Generator Plan',
        content: 'Primary contact: Dr. Mwita (+255712000111). Backup 50kVA generator stationed at gate 2.',
        category: 'logistics',
        pinned: true
      }
    });

    assert.equal(noteRes.status, 201);
    assert.equal(noteRes.data.note.pinned, true);
    assert.equal(noteRes.data.note.authorName, 'Zainab Planner');
    logPass('Workspace member adds pinned emergency note to shared knowledge base');

    // =============================================================
    // SECTION 3: REAL-TIME BUDGET LEDGER & EXPENSES
    // =============================================================
    console.log('\n--- 3. Budget Ledger, Expenses & Over-Budget Triggers ---');

    // 3.1 Initial budget summary shows workspace budget
    const initBudget = await request(`/api/workspaces/${workspaceId}/budget`, {
      headers: { Authorization: `Bearer ${groomToken}` }
    });

    assert.equal(initBudget.status, 200);
    assert.equal(initBudget.data.summary.totalBudget, 20000000);
    assert.equal(initBudget.data.summary.totalActual, 0);
    logPass('Initial budget summary reflects wedding target budget of TSh 20,000,000');

    // 3.2 Add budget category
    const catRes = await request(`/api/workspaces/${workspaceId}/budget/categories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: {
        name: 'Photography & Cinematography',
        icon: '📸',
        allocatedAmount: 2500000
      }
    });

    assert.equal(catRes.status, 201);
    assert.equal(catRes.data.category.name, 'Photography & Cinematography');
    assert.equal(catRes.data.category.allocatedAmount, 2500000);
    const catId = catRes.data.category.id;
    logPass('Host creates budget category with target allocation');

    // 3.3 Log normal expense within allocation
    const exp1Res = await request(`/api/workspaces/${workspaceId}/budget/expenses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${plannerToken}` },
      body: {
        title: 'Drone & 4K Wedding Video Package',
        categoryId: catId,
        actualAmount: 2000000,
        paidAmount: 800000,
        status: 'deposit_paid'
      }
    });

    assert.equal(exp1Res.status, 201);
    assert.equal(exp1Res.data.expense.actualAmount, 2000000);
    assert.equal(exp1Res.data.expense.paidAmount, 800000);
    logPass('Planner records expense with deposit payment within category allocation');

    // 3.4 Check budget summary & category variance
    const budgetAfterExp1 = await request(`/api/workspaces/${workspaceId}/budget`, {
      headers: { Authorization: `Bearer ${brideToken}` }
    });

    assert.equal(budgetAfterExp1.data.summary.totalActual, 2000000);
    assert.equal(budgetAfterExp1.data.summary.totalPaid, 800000);
    assert.equal(budgetAfterExp1.data.summary.remainingBudget, 18000000);
    const photoCat = budgetAfterExp1.data.categories.find(c => c.id === catId);
    assert.equal(photoCat.actual, 2000000);
    assert.equal(photoCat.isOverBudget, false);
    logPass('Budget summary correctly calculates committed, paid, and remaining balance');

    // 3.5 Log extra expense that triggers OVER-BUDGET condition
    const expOverRes = await request(`/api/workspaces/${workspaceId}/budget/expenses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${plannerToken}` },
      body: {
        title: 'Extra Photobook and Live Stream Crane',
        categoryId: catId,
        actualAmount: 1000000, // Total now 3,000,000 vs 2,500,000 allocation!
        paidAmount: 500000,
        status: 'deposit_paid'
      }
    });

    assert.equal(expOverRes.status, 201);

    // Verify over-budget flag on category
    const budgetOver = await request(`/api/workspaces/${workspaceId}/budget`, {
      headers: { Authorization: `Bearer ${groomToken}` }
    });
    const photoCatOver = budgetOver.data.categories.find(c => c.id === catId);
    assert.equal(photoCatOver.actual, 3000000);
    assert.equal(photoCatOver.isOverBudget, true);
    assert.equal(photoCatOver.variance, -500000);
    logPass('Category correctly flags over-budget status and negative variance when limit exceeded');

    // 3.6 Verify budget_alert notification was sent to workspace owner
    const groomNotifs = await request(`/api/workspaces/${workspaceId}/notifications`, {
      headers: { Authorization: `Bearer ${groomToken}` }
    });
    const budgetAlert = groomNotifs.data.notifications.find(n => n.type === 'budget_alert');
    assert.ok(budgetAlert);
    assert.ok(budgetAlert.message.includes('over budget'));
    logPass('System automatically dispatches budget_alert notification to workspace host');

    // 3.7 Financial Privacy: Vendor role cannot view budget ledger (403 Forbidden)
    const vendorBudgetReq = await request(`/api/workspaces/${workspaceId}/budget`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    assert.equal(vendorBudgetReq.status, 403);
    logPass('Vendor role is blocked from viewing financials/budget ledger (403 Forbidden)');

    // 3.8 Delete expense and check rollback of actuals
    const delExpRes = await request(`/api/workspaces/${workspaceId}/budget/expenses/${expOverRes.data.expense.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${groomToken}` }
    });
    assert.equal(delExpRes.status, 200);

    const budgetAfterDel = await request(`/api/workspaces/${workspaceId}/budget`, {
      headers: { Authorization: `Bearer ${groomToken}` }
    });
    const photoCatBack = budgetAfterDel.data.categories.find(c => c.id === catId);
    assert.equal(photoCatBack.actual, 2000000);
    assert.equal(photoCatBack.isOverBudget, false);
    logPass('Deleting expense updates category totals and clears over-budget alert');

    // =============================================================
    // SECTION 4: NOTIFICATIONS MANAGEMENT
    // =============================================================
    console.log('\n--- 4. Real-Time Notification Management ---');

    // 4.1 Mark single notification as read
    const singleNotifId = groomNotifs.data.notifications[0]?.id;
    if (singleNotifId) {
      const markSingle = await request(`/api/workspaces/${workspaceId}/notifications/${singleNotifId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${groomToken}` }
      });
      assert.equal(markSingle.status, 200);
      assert.equal(markSingle.data.notification.read, true);
      logPass('Host marks individual notification as read');
    }

    // 4.2 Mark all notifications as read
    const markAll = await request(`/api/workspaces/${workspaceId}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${groomToken}` }
    });
    assert.equal(markAll.status, 200);

    const groomNotifsAfter = await request(`/api/workspaces/${workspaceId}/notifications`, {
      headers: { Authorization: `Bearer ${groomToken}` }
    });
    assert.ok(groomNotifsAfter.data.notifications.every(n => n.read === true));
    logPass('Host marks all notifications as read in bulk');

    // =============================================================
    // SECTION 5: MULTI-USER SYNCHRONIZATION & PERSISTENCE
    // =============================================================
    console.log('\n--- 5. Authoritative Multi-User Synchronization ---');

    // 5.1 Data created by Planner is queryable by Bride with identical IDs and state
    const brideTasks = await request(`/api/workspaces/${workspaceId}/tasks`, {
      headers: { Authorization: `Bearer ${brideToken}` }
    });
    assert.ok(brideTasks.data.tasks.some(t => t.id === task1Id && t.status === 'completed'));
    logPass('State is synchronized in real-time across distinct user sessions and tokens');

  } catch (err) {
    logFail('Unexpected test failure in Phase 2 suite', err);
  } finally {
    if (server) {
      await new Promise(r => server.close(r));
    }
  }

  console.log('\n====================================================');
  console.log(`📊 PHASE 2 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
