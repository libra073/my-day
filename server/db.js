import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE = path.join(__dirname, 'data', 'db.json');
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'myday-data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Notice: Could not create DATA_DIR:', e.message);
}

// In-memory representation with transactional flush
let dbData = null;
let writePromise = Promise.resolve();

function hashPassword(password) {
  const salt = 'myday_salt_2026';
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

function getInitialDatabase() {
  const defaultPasswordHash = hashPassword('password123');

  return {
    users: [
      {
        id: 'usr-groom',
        name: 'John Msuya (Groom)',
        email: 'john@myday.co.tz',
        phone: '+255 777 123 456',
        passwordHash: defaultPasswordHash,
        globalRole: 'customer',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-bride',
        name: 'Sarah Kimaro (Bride)',
        email: 'sarah@myday.co.tz',
        phone: '+255 777 654 321',
        passwordHash: defaultPasswordHash,
        globalRole: 'customer',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-planner',
        name: 'Neema Wedding Planners',
        email: 'neema@planning.co.tz',
        phone: '+255 714 888 777',
        passwordHash: defaultPasswordHash,
        globalRole: 'customer',
        createdAt: new Date().toISOString()
      },
      {
        id: 'prov-1',
        name: 'Grand Imperial Hall',
        email: 'info@grandimperial.co.tz',
        phone: '+255 777 999 888',
        passwordHash: defaultPasswordHash,
        globalRole: 'provider',
        createdAt: new Date().toISOString()
      },
      {
        id: 'admin-1',
        name: 'MY DAY Superadmin',
        email: 'admin@myday.co.tz',
        phone: '+255 22 210 0900',
        passwordHash: defaultPasswordHash,
        globalRole: 'admin',
        createdAt: new Date().toISOString()
      }
    ],
    workspaces: [
      {
        id: 'wed-1',
        title: "John & Sarah's Wedding",
        ownerId: 'usr-groom',
        bride: 'Sarah',
        groom: 'John',
        date: '2026-12-25',
        location: 'Dar es Salaam',
        guests: 300,
        budget: 15000000,
        currency: 'TZS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    workspace_members: [
      {
        id: 'wm-1',
        workspaceId: 'wed-1',
        userId: 'usr-groom',
        role: 'owner', // 'owner' | 'partner' | 'planner' | 'family' | 'friend' | 'vendor'
        joinedAt: new Date().toISOString(),
        invitedBy: null
      },
      {
        id: 'wm-2',
        workspaceId: 'wed-1',
        userId: 'usr-bride',
        role: 'partner',
        joinedAt: new Date().toISOString(),
        invitedBy: 'usr-groom'
      }
    ],
    invitations: [],
    sessions: [
      {
        token: 'token-groom-session',
        userId: 'usr-groom',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        token: 'token-bride-session',
        userId: 'usr-bride',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        token: 'token-planner-session',
        userId: 'usr-planner',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        token: 'token-provider-session',
        userId: 'prov-1',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        token: 'token-admin-session',
        userId: 'admin-1',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    // -------------------------------------------------------------------------
    // Phase 2: Tasks, Decisions, Notes, Budget Categories, Expenses, Notifications
    // -------------------------------------------------------------------------
    tasks: [
      {
        id: 'task-1',
        workspaceId: 'wed-1',
        title: 'Book Grand Imperial Reception Hall',
        description: 'Verify sound limits, air conditioning, and confirm down payment terms.',
        assigneeId: 'usr-groom',
        assigneeName: 'John Msuya (Groom)',
        dueDate: '2026-10-30',
        priority: 'high',
        status: 'pending', // 'pending' | 'completed' | 'missed' | 'overdue'
        comments: [
          {
            id: 'c-1',
            userId: 'usr-bride',
            userName: 'Sarah Kimaro (Bride)',
            text: 'Please ask about generator fuel policy for evening power cuts.',
            createdAt: new Date().toISOString()
          }
        ],
        activityHistory: [
          {
            id: 'act-1',
            action: 'created',
            userId: 'usr-groom',
            userName: 'John Msuya (Groom)',
            timestamp: new Date().toISOString(),
            details: 'Task created with high priority'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        version: 1
      },
      {
        id: 'task-2',
        workspaceId: 'wed-1',
        title: 'Confirm Food Tasting Menu for 300 Guests',
        description: 'Coordinate with catering team for pilau, biryani, roast beef, and dessert options.',
        assigneeId: 'usr-bride',
        assigneeName: 'Sarah Kimaro (Bride)',
        dueDate: '2026-11-15',
        priority: 'high',
        status: 'pending',
        comments: [],
        activityHistory: [
          {
            id: 'act-2',
            action: 'created',
            userId: 'usr-bride',
            userName: 'Sarah Kimaro (Bride)',
            timestamp: new Date().toISOString(),
            details: 'Task created'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        version: 1
      }
    ],
    decisions: [
      {
        id: 'dec-1',
        workspaceId: 'wed-1',
        title: 'Wedding Color Theme & Palette',
        description: 'Select the primary decorative colors for reception stage, chair sashes, and floral arches.',
        category: 'decor',
        status: 'agreed', // 'open' | 'agreed' | 'rejected'
        options: [
          { id: 'opt-1', text: 'Royal Emerald Green & Warm Gold', votes: ['usr-groom', 'usr-bride'] },
          { id: 'opt-2', text: 'Blush Pink & Champagne Rose', votes: [] },
          { id: 'opt-3', text: 'Navy Blue & Crisp Silver', votes: [] }
        ],
        decisionNotes: 'Agreed on Emerald Green & Warm Gold. Matches Grand Imperial ballroom chandeliers.',
        decidedBy: 'usr-bride',
        decidedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'dec-2',
        workspaceId: 'wed-1',
        title: 'DJ Band vs Live Acoustic Saxophone MC',
        description: 'Decide entertainment style for guest arrival cocktail hour and dancing.',
        category: 'entertainment',
        status: 'open',
        options: [
          { id: 'opt-4', text: 'Full Live Band + Modern DJ mix', votes: ['usr-groom'] },
          { id: 'opt-5', text: 'Solo Saxophonist + Master DJ', votes: ['usr-bride'] }
        ],
        decisionNotes: '',
        decidedBy: null,
        decidedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    notes: [
      {
        id: 'note-1',
        workspaceId: 'wed-1',
        title: 'Emergency Vendor Contacts & Protocols',
        content: 'Police escort contact: +255 777 000 111. Backup generator technician on standby from 2 PM to 1 AM.',
        category: 'general',
        pinned: true,
        authorId: 'usr-groom',
        authorName: 'John Msuya (Groom)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    budget_categories: [
      { id: 'bcat-venue', workspaceId: 'wed-1', name: 'Kumbi (Venue)', icon: '🏰', allocatedAmount: 4000000, order: 1 },
      { id: 'bcat-catering', workspaceId: 'wed-1', name: 'Catering & Beverages', icon: '🍽️', allocatedAmount: 5000000, order: 2 },
      { id: 'bcat-decor', workspaceId: 'wed-1', name: 'Wapambaji (Decorations)', icon: '🎨', allocatedAmount: 2500000, order: 3 },
      { id: 'bcat-entertainment', workspaceId: 'wed-1', name: 'MC & Entertainment', icon: '🎤', allocatedAmount: 1500000, order: 4 },
      { id: 'bcat-saloon', workspaceId: 'wed-1', name: 'Saloon & Makeup', icon: '💇', allocatedAmount: 1000000, order: 5 },
      { id: 'bcat-transport', workspaceId: 'wed-1', name: 'Luxury Transport', icon: '🚗', allocatedAmount: 1000000, order: 6 }
    ],
    expenses: [
      {
        id: 'exp-1',
        workspaceId: 'wed-1',
        categoryId: 'bcat-venue',
        title: 'Grand Imperial Hall Deposit',
        estimatedAmount: 2500000,
        actualAmount: 2500000,
        paidAmount: 750000,
        status: 'deposit_paid', // 'planned' | 'deposit_paid' | 'paid_in_full'
        vendorId: 'venue-1',
        addedBy: 'usr-groom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'exp-2',
        workspaceId: 'wed-1',
        categoryId: 'bcat-decor',
        title: 'Floral Arches & Stage Backdrop',
        estimatedAmount: 1800000,
        actualAmount: 1600000,
        paidAmount: 500000,
        status: 'deposit_paid',
        vendorId: 'decor-1',
        addedBy: 'usr-bride',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        workspaceId: 'wed-1',
        userId: 'usr-groom',
        type: 'task_assigned',
        title: 'Task Assigned',
        message: 'You were assigned to "Book Grand Imperial Reception Hall"',
        read: false,
        createdAt: new Date().toISOString(),
        entityId: 'task-1',
        entityType: 'task'
      }
    ],
    appointments: [
      {
        id: 'app-1',
        workspaceId: 'wed-1',
        vendorId: 'prov-1',
        customerId: 'usr-groom',
        customerName: 'John Msuya (Groom)',
        title: 'Grand Ballroom Acoustics & Menu Tasting',
        startIso: '2026-10-20T07:00:00.000Z', // 10:00 AM EAT (Tuesday)
        endIso: '2026-10-20T08:30:00.000Z',   // 11:30 AM EAT (Tuesday)
        status: 'confirmed', // 'confirmed' | 'rescheduled' | 'cancelled'
        allowException: false,
        exceptionReason: null,
        notes: 'Tour of main hall and food tasting with catering chef',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    vendor_schedules: [
      {
        vendorId: 'prov-1',
        useDefault: false,
        timezone: 'Africa/Dar_es_Salaam',
        weeklyHours: {
          0: null,
          1: { open: '08:00', close: '17:00' },
          2: { open: '08:00', close: '17:00' },
          3: { open: '08:00', close: '17:00' },
          4: { open: '08:00', close: '17:00' },
          5: { open: '08:00', close: '17:00' },
          6: { open: '09:00', close: '14:00' } // Custom Saturday viewing & tasting
        },
        daysOff: [0],
        holidays: ['2026-12-25', '2026-12-26'],
        specialHours: [
          { date: '2026-11-28', open: '09:00', close: '13:00', reason: 'Tasting Showcase' }
        ],
        updatedAt: new Date().toISOString()
      }
    ],
    bookings: [
      {
        id: 'bk-demo-1',
        customerId: 'usr-groom',
        providerId: 'venue-1',
        category: 'kumbi',
        packageId: 'standard',
        weddingId: 'wed-1',
        date: '2026-12-25',
        price: 2500000,
        deposit: 750000,
        paidAmount: 750000,
        commission: 125000,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    payments: [
      {
        id: 'pay-demo-1',
        bookingId: 'bk-demo-1',
        amount: 750000,
        gateway: 'mpesa',
        txnRef: 'TXN-982341',
        status: 'success',
        createdAt: new Date().toISOString()
      }
    ],
    password_resets: []
  };
}

export function loadDatabase() {
  if (dbData) return dbData;

  const targetFile = fs.existsSync(DB_FILE) ? DB_FILE : (fs.existsSync(SEED_FILE) ? SEED_FILE : null);

  if (targetFile) {
    try {
      const raw = fs.readFileSync(targetFile, 'utf-8');
      dbData = JSON.parse(raw);

      // Automatic schema migration for new collections if loading older DB file
      const initial = getInitialDatabase();
      let modified = false;

      const collections = [
        'tasks',
        'decisions',
        'notes',
        'budget_categories',
        'expenses',
        'notifications',
        'appointments',
        'vendor_schedules',
        'bookings',
        'payments',
        'password_resets'
      ];

      for (const col of collections) {
        if (!dbData[col]) {
          dbData[col] = initial[col] || [];
          modified = true;
        }
      }

      if (modified) {
        saveDatabaseSync();
      }

      return dbData;
    } catch (err) {
      console.warn('Could not read existing database, generating fresh initial store:', err.message);
    }
  }

  dbData = getInitialDatabase();
  saveDatabaseSync();
  return dbData;
}

export function saveDatabaseSync() {
  if (!dbData) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.${Date.now()}-${Math.random().toString(36).substring(2, 7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbData, null, 2), 'utf-8');
    try {
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      fs.copyFileSync(tempFile, DB_FILE);
      try { fs.unlinkSync(tempFile); } catch (_) {}
    }
  } catch (err) {
    console.warn('Notice: Could not write database sync to disk:', err.message);
  }
}

export async function saveDatabase() {
  if (!dbData) return;
  writePromise = writePromise.then(async () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        await fs.promises.mkdir(DATA_DIR, { recursive: true });
      }
      const tempFile = `${DB_FILE}.${Date.now()}-${Math.random().toString(36).substring(2, 7)}.tmp`;
      await fs.promises.writeFile(tempFile, JSON.stringify(dbData, null, 2), 'utf-8');
      try {
        await fs.promises.rename(tempFile, DB_FILE);
      } catch (e) {
        await fs.promises.copyFile(tempFile, DB_FILE);
        try { await fs.promises.unlink(tempFile); } catch (_) {}
      }
    } catch (err) {
      console.warn('Notice: Could not write database async to disk:', err.message);
    }
  });
  return writePromise;
}

export function resetDatabase() {
  dbData = getInitialDatabase();
  saveDatabaseSync();
  return dbData;
}

export { hashPassword };
