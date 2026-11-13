'use strict';
/* MY DAY — marketplace, planner, dashboard */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
const icon = (n, cls = 'ic') => `<svg class="${cls}"><use href="#i-${n}"/></svg>`;
const fmtTZS = n => 'TZS ' + Math.round(n).toLocaleString('en-US');
const fmtM = n => n >= 1e6 ? 'TZS ' + (+(n / 1e6).toFixed(1)) + 'M' : n >= 1e3 ? 'TZS ' + Math.round(n / 1e3) + 'K' : 'TZS ' + Math.round(n);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    'brand.sub': 'WEDDING MARKETPLACE',
    'nav.home': 'Home', 'nav.planner': 'AI Planner', 'nav.services': 'Browse Services', 'nav.profile': 'Wedding Profile', 'nav.dashboard': 'Event Dashboard', 'nav.bookings': 'My Bookings', 'nav.vendor': 'Become a Vendor', 'nav.login': 'Log In',
    'backTop': 'Back to top', 'theme.dark': 'Dark', 'theme.light': 'Light', 'a11y.theme': 'Toggle dark mode', 'a11y.backTop': 'Back to top',
    'hero.badge': "Tanzania's Premier Wedding Marketplace", 'hero.title1': 'Your day.', 'hero.title2': 'Beautifully planned.',
    'hero.sub': 'Discover exceptional wedding professionals and bring your dream celebration to life.',
    'hero.cta1': 'Explore vendors', 'hero.cta2': 'Plan with AI', 'hero.caption': 'Coastal and Inland Tanzania · Curated Celebrations',
    'search.ph': 'Search venues, MCs, decor...', 'search.category': 'Category', 'search.region': 'Region', 'search.date': 'Event date',
    'search.allCats': 'All Categories', 'search.allRegions': 'All Regions',
    'trust.1': '100% Mobile Money', 'trust.2': '100% Verified', 'trust.3': 'Tanzania Nationwide',
    'services.eyebrow': 'Browse Services', 'services.title1': 'Exceptional vendors,', 'services.title2': 'verified for you',
    'services.sub': 'Every professional is vetted, reviewed by real couples, and payable with mobile money.',
    'services.empty': 'No vendors match your search', 'services.emptySub': 'Try a different category or region.', 'services.clear': 'Clear filters',
    'services.count': n => `${n} vendor${n === 1 ? '' : 's'}`,
    'sort.recommended': 'Recommended', 'sort.priceAsc': 'Price: low to high', 'sort.priceDesc': 'Price: high to low', 'sort.rating': 'Top rated',
    'vendor.from': 'from', 'vendor.view': 'View', 'vendor.book': 'Book', 'vendor.verified': 'Verified', 'vendor.pending': 'Pending review', 'vendor.reviews': n => `(${n})`,
    'planner.eyebrow': 'AI Planner', 'planner.title1': 'Meet your', 'planner.title2': 'smart wedding planner',
    'planner.sub': 'Budgets, vendor matching, timelines and guest math — ask anything about your big day and get answers grounded in real Tanzanian vendors.',
    'planner.f1t': 'Budget intelligence', 'planner.f1s': 'Smart splits in TZS, saved to your profile',
    'planner.f2t': 'Vendor matching', 'planner.f2s': 'Matched by region, style and price',
    'planner.f3t': 'Living checklist', 'planner.f3s': 'Timelines that sync to your dashboard',
    'ai.smart': 'Smart Planner', 'ai.online': 'Online · replies instantly', 'ai.ph': 'Ask about budgets, venues, timelines...', 'ai.title': 'MY DAY AI',
    'ai.chip1': 'Split my budget', 'ai.chip2': 'Venues in Zanzibar', 'ai.chip3': 'Build my checklist', 'ai.chip4': 'Catering for 250 guests',
    'dash.eyebrow': 'Event Dashboard', 'dash.title1': 'Your celebration,', 'dash.title2': 'at a glance',
    'dash.search': 'Search anything...', 'dash.welcome': 'Welcome back,', 'dash.welcomeSub': "Here's an overview of your wedding progress",
    'dash.stat1': 'Budget Used', 'dash.stat2': 'Guests Confirmed', 'dash.stat3': 'Vendors Booked',
    'dash.stat1sub': '↑ 12% from last month', 'dash.stat2sub': n => `of ${n} invited`, 'dash.stat3sub': n => `of ${n} planned`,
    'dash.budget': 'Budget Breakdown', 'dash.used': 'used', 'dash.weekly': 'Weekly Planning',
    'dash.q1': 'Add Task', 'dash.q1s': 'New to-do', 'dash.q2': 'Invite', 'dash.q2s': 'Collaboration', 'dash.q3': 'Set Goal', 'dash.q3s': 'Track progress', 'dash.q4': 'Schedule', 'dash.q4s': 'Wedding date',
    'dash.checklist': 'Planning Checklist', 'dash.addTask': 'Add a task...', 'dash.countdown': 'Countdown to the big day', 'dash.days': 'days',
    'dash.countNote': (d, n) => d > 0 ? `${n} — every week counts. Keep the checklist moving!` : 'The big day is here. Congratulations!',
    'range.month': 'This Month', 'range.quarter': 'Last 3 Months', 'range.full': 'Full Plan',
    'week.this': 'This week', 'week.last': 'Last week',
    'bookings.eyebrow': 'My Bookings', 'bookings.title1': 'Your booked', 'bookings.title2': 'dream team',
    'bookings.sub': 'Deposits are held securely and released to vendors after your event.',
    'bookings.empty': 'No bookings yet', 'bookings.emptySub': 'Browse verified vendors and book your first professional.', 'bookings.cta': 'Explore vendors',
    'bookings.deposit': 'deposit paid', 'bookings.cancel': 'Cancel', 'bookings.view': 'View', 'bookings.cancelled': 'Cancelled', 'bookings.confirmed': 'Confirmed', 'bookings.pending': 'Pending',
    'bookings.cancelToast': 'Booking cancelled', 'bookings.undo': 'Undo', 'bookings.restored': 'Booking restored',
    'profile.eyebrow': 'Wedding Profile', 'profile.title1': 'Tell us about', 'profile.title2': 'your day',
    'profile.p1': 'Partner 1', 'profile.p2': 'Partner 2', 'profile.date': 'Wedding date', 'profile.region': 'Region', 'profile.budget': 'Budget (TZS)', 'profile.guests': 'Guests invited', 'profile.confirmed': 'RSVPs confirmed', 'profile.theme': 'Celebration style', 'profile.save': 'Save profile', 'profile.saved': 'Profile saved — dashboard updated',
    'profile.vision': (names, theme, region, date) => `${names} are planning a ${theme.toLowerCase()} celebration in ${region} on ${date}. Vendors and budgets below are tailored to this vision.`,
    'vendor.eyebrow': 'Become a Vendor', 'vendor.title1': 'Grow your', 'vendor.title2': 'wedding business',
    'vendor.sub': "Join Tanzania's fastest-growing wedding marketplace. Get discovered by couples who are ready to book and pay with mobile money.",
    'vendor.s1': 'couples planning', 'vendor.s2': 'on-time payouts', 'vendor.s3': 'listing fee',
    'vendor.st1t': 'Apply in minutes', 'vendor.st1s': 'Tell us about your business and services.',
    'vendor.st2t': 'Get verified', 'vendor.st2s': 'Our team checks your credentials within 48 hours.',
    'vendor.st3t': 'Receive bookings', 'vendor.st3s': 'Couples book and pay deposits straight to your till.',
    'vendor.formTitle': 'Vendor application', 'vendor.name': 'Business name', 'vendor.price': 'Starting price (TZS)', 'vendor.phone': 'Business phone', 'vendor.desc': 'Describe your services', 'vendor.descPh': 'What makes your service special?', 'vendor.mm': 'Mobile money accepted', 'vendor.apply': 'Apply to list',
    'vendor.applied': 'Application received — your listing is pending review', 'vendor.mmRequired': 'Select at least one mobile money provider', 'vendor.badPhone': 'Enter a valid Tanzanian phone number',
    'footer.tag': "Your day, beautifully planned — from Zanzibar's shores to Kilimanjaro's slopes.",
    'footer.explore': 'Explore', 'footer.couples': 'For couples', 'footer.support': 'Support', 'footer.help': 'Help Center', 'footer.payments': 'Mobile Money', 'footer.made': 'Made with love in Tanzania',
    'notif.title': 'Notifications', 'notif.read': 'Mark all read',
    'date.ph': 'Pick a date', 'date.today': 'Today', 'date.clear': 'Clear', 'date.prev': 'Previous month', 'date.next': 'Next month',
    'auth.loginTab': 'Log In', 'auth.signupTab': 'Create account',
    'auth.loginTitle': 'Welcome back', 'auth.loginSub': 'Log in to your local preview account on this browser.',
    'auth.signupTitle': 'Create your account', 'auth.signupSub': 'Try your account on this browser. Preview only — use a test password.',
    'role.title': 'Welcome to MY DAY', 'role.sub': 'How would you like to use MY DAY?',
    'role.customerT': "I'm planning a wedding", 'role.customerS': 'Discover vendors, plan your wedding and manage bookings.', 'role.customerTag': 'Customer account',
    'role.vendorT': 'I offer wedding services', 'role.vendorS': 'Showcase your business, receive bookings and grow your business.', 'role.vendorTag': 'Vendor account',
    'role.adminNote': 'Administrator accounts are created internally, never through public registration.',
    'role.chosen': r => `Signing up as: ${r}`, 'role.change': 'Change', 'role.demo': 'Demo accounts', 'role.demoHint': 'Tap to fill',
    'vdash.title': 'Your business dashboard', 'vdash.status': 'Listing status', 'vdash.requests': 'Booking requests', 'vdash.accept': 'Accept', 'vdash.decline': 'Decline',
    'vdash.escrow': 'In escrow', 'vdash.released': 'Released to you', 'vdash.empty': 'No new requests right now — couples will find you here.',
    'vdash.pending': 'Pending review', 'vdash.verified': 'Verified', 'vdash.suspended': 'Suspended', 'vdash.accepted': 'Request accepted — the couple has been notified.', 'vdash.declined': 'Request declined.',
    'nav.admin': 'Platform Admin', 'adm.eyebrow': 'Restricted access', 'adm.title': 'Platform Admin',
    'adm.sub': 'MY DAY platform management team. Manage customers and vendors, verify businesses, approve or suspend listings, monitor bookings and transactions, handle complaints, categories and regions, analytics and settings.',
    'adm.overview': 'Overview', 'adm.customers': 'Customers', 'adm.vendors': 'Vendors', 'adm.bookings': 'Bookings', 'adm.complaints': 'Complaints', 'adm.cats': 'Categories & Regions', 'adm.settings': 'Settings',
    'adm.custCount': 'Customer accounts', 'adm.vendorCount': 'Listed vendors', 'adm.bookCount': 'Bookings', 'adm.gmv': 'Gross booking value', 'adm.verify': 'Verify', 'adm.suspend': 'Suspend', 'adm.restore': 'Restore',
    'adm.resolve': 'Resolve', 'adm.open': 'Open', 'adm.resolved': 'Resolved', 'adm.addRegion': 'Add region', 'adm.remove': 'Remove', 'adm.escrowOn': 'Escrow protection on deposits',
    'adm.verifyReq': 'Verification required before listing', 'adm.fee': 'Platform listing fee (%)', 'adm.verified': 'Vendor verified', 'adm.suspendedV': 'Vendor suspended', 'adm.restored': 'Vendor restored',
    'adm.resolvedC': 'Complaint marked resolved', 'adm.regionAdded': 'Region added', 'adm.regionRemoved': 'Region removed', 'adm.noComplaints': 'No complaints — everyone is happy.',
    'adm.couple': 'Couple', 'adm.vendor': 'Vendor', 'adm.amount': 'Amount', 'adm.status': 'Status', 'adm.date': 'Date', 'adm.email': 'Email', 'adm.role': 'Role', 'adm.joined': 'Joined',
    'auth.errUnavailable': 'Account access is unavailable. Open this preview on localhost or HTTPS and try again.',
    'auth.name': 'Full name', 'auth.email': 'Email address', 'auth.password': 'Password', 'auth.confirm': 'Confirm password', 'auth.newPass': 'New password',
    'auth.forgot': 'Forgot password?', 'auth.loginBtn': 'Log in', 'auth.signupBtn': 'Create account',
    'auth.noAccount': 'New to MY DAY?', 'auth.haveAccount': 'Already have an account?',
    'auth.errName': 'Enter your full name', 'auth.errEmail': 'Enter a valid email address', 'auth.errPass': 'Use at least 8 characters', 'auth.errMatch': 'Passwords do not match',
    'auth.errNoUser': 'No account found for this email — create one instead', 'auth.errWrongPass': 'Incorrect password — try again or reset it', 'auth.errExists': 'This email already has an account — log in instead',
    'auth.welcome': n => `Karibu, ${n}! You are logged in.`, 'auth.created': n => `Account created — karibu, ${n}!`, 'auth.logoutDone': 'Logged out — see you soon',
    'auth.forgotTitle': 'Reset your password', 'auth.forgotSub': 'Enter your local account email to generate a preview reset code. No email will be sent.',
    'auth.sendCode': 'Get preview code', 'auth.backLogin': 'Back to log in',
    'auth.codeTitle': 'Reset your local account', 'auth.codeSub': e => `Use the preview code below for ${e}, then choose a new test password.`,
    'auth.demoInbox': 'Demo inbox', 'auth.demoNote': 'This preview runs on your device — no real email is sent. Your code:',
    'auth.code': 'Reset code', 'auth.resetBtn': 'Set new password', 'auth.resend': 'Resend code', 'auth.resent': 'A new code is waiting in your demo inbox',
    'auth.errCodeFmt': 'Enter the 6-digit code', 'auth.errCode': 'That code is wrong or expired — resend a new one',
    'auth.resetDone': 'Password updated', 'auth.resetDoneSub': 'Your new password is active. Log in to continue planning.',
    'auth.resetNotif': 'Your MY DAY password was changed.', 'auth.welcomeNotif': n => `Welcome to MY DAY, ${n}! Your planning space is ready.`,
    'auth.showPass': 'Show password', 'auth.hidePass': 'Hide password', 'auth.memberSince': d => `Member since ${d}`,
    'modal.name': 'Your name', 'modal.email': 'Email address', 'modal.logout': 'Log out', 'modal.account': 'Your account', 'modal.loggedIn': 'Logged in as',
    'modal.bookTitle': 'Book', 'modal.bookSub': 'Pay a 30% deposit with mobile money. The balance is due after your event.',
    'modal.package': 'Package', 'modal.date': 'Event date', 'modal.guests': 'Guests', 'modal.provider': 'Pay with', 'modal.phone': 'Mobile money number',
    'modal.total': 'Total', 'modal.deposit': 'Deposit due now (30%)', 'modal.balance': 'Balance after event', 'modal.pay': 'Pay deposit', 'modal.processing': 'Sending payment request...',
    'modal.successTitle': 'Booking confirmed!', 'modal.successSub': 'A payment request was sent to your phone. Your vendor has been notified.',
    'modal.viewBookings': 'View my bookings', 'modal.done': 'Done', 'modal.badPhone': 'Enter a valid number, e.g. 0712 345 678',
    'modal.taskTitle': 'Add a task', 'modal.taskSub': 'It will appear on your planning checklist.', 'modal.taskLabel': 'Task', 'modal.add': 'Add task',
    'modal.inviteTitle': 'Invite a collaborator', 'modal.inviteSub': 'Plan together — partners and family can track progress.', 'modal.inviteBtn': 'Send invite', 'modal.invited': n => `${n} was invited to plan with you`,
    'modal.goalTitle': 'Set a goal', 'modal.goalSub': 'Goals keep your planning on track.', 'modal.goalLabel': 'Goal', 'modal.goalTarget': 'Target', 'modal.goalBtn': 'Set goal',
    'modal.scheduleTitle': 'Wedding date', 'modal.scheduleSub': 'Your countdown and timeline update instantly.', 'modal.scheduleBtn': 'Save date', 'modal.scheduled': 'Wedding date updated',
    'modal.payTitle': 'Mobile money on MY DAY', 'modal.paySub': 'Every booking is protected. Deposits are held in escrow and released to your vendor after the event. We accept M-Pesa, Tigo Pesa, Airtel Money and HaloPesa — no cards, no bank visits.',
    'task.added': 'Task added to checklist', 'task.deleted': 'Task deleted', 'task.restored': 'Task restored',
    'goal.added': 'Goal added', 'goal.done': 'Goal complete — hongera!',
    'chat.welcome': "Habari! I'm your MY DAY planner. I can split your budget, match you with verified vendors, build your checklist and do guest math. What are we planning today?",
    'chat.viewAll': 'Browse all', 'chat.saveBudget': 'Save as my budget', 'chat.budgetSaved': 'Budget saved to your profile', 'chat.addChecklist': 'Add to my checklist', 'chat.checklistAdded': 'Checklist updated — see your dashboard',
    'cat.Venues': 'Venues', 'cat.Photography': 'Photography', 'cat.Decor & Florals': 'Decor & Florals', 'cat.Catering': 'Catering', 'cat.MC & Entertainment': 'MC & Entertainment', 'cat.Music & DJ': 'Music & DJ', 'cat.Beauty & Henna': 'Beauty & Henna', 'cat.Transport': 'Transport',
    'reg.Dar es Salaam': 'Dar es Salaam', 'reg.Zanzibar': 'Zanzibar', 'reg.Arusha': 'Arusha', 'reg.Mwanza': 'Mwanza', 'reg.Dodoma': 'Dodoma', 'reg.Moshi': 'Moshi',
    'theme.Coastal': 'Coastal', 'theme.Garden': 'Garden', 'theme.Traditional': 'Traditional', 'theme.Modern': 'Modern', 'theme.Destination': 'Destination',
    'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'monthsFull': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    'days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    'budget.venue': 'Venue', 'budget.catering': 'Catering', 'budget.decor': 'Decor', 'budget.photo': 'Photo & Video', 'budget.music': 'Music & MC', 'budget.attire': 'Attire & Beauty',
  },
  sw: {
    'brand.sub': 'SOKO LA HARUSI',
    'nav.home': 'Mwanzo', 'nav.planner': 'Mpangaji AI', 'nav.services': 'Vinjari Huduma', 'nav.profile': 'Wasifu wa Harusi', 'nav.dashboard': 'Dashibodi', 'nav.bookings': 'Uhifadhi Wangu', 'nav.vendor': 'Kuwa Muuzaji', 'nav.login': 'Ingia',
    'backTop': 'Rudi juu', 'theme.dark': 'Giza', 'theme.light': 'Mwanga', 'a11y.theme': 'Badili hali ya giza', 'a11y.backTop': 'Rudi juu',
    'hero.badge': 'Soko Kuu la Harusi Tanzania', 'hero.title1': 'Siku yako.', 'hero.title2': 'Imepangwa kwa uzuri.',
    'hero.sub': 'Gundua wataalamu bora wa harusi na ulete sherehe ya ndoto yako uhai.',
    'hero.cta1': 'Tafuta wauzaji', 'hero.cta2': 'Panga na AI', 'hero.caption': 'Pwani na Bara Tanzania · Sherehe Zilizochaguliwa',
    'search.ph': 'Tafuta ukumbi, MC, mapambo...', 'search.category': 'Kategoria', 'search.region': 'Mkoa', 'search.date': 'Tarehe ya tukio',
    'search.allCats': 'Kategoria Zote', 'search.allRegions': 'Mikoa Yote',
    'trust.1': '100% Mobile Money', 'trust.2': '100% Waliothibitishwa', 'trust.3': 'Tanzania Nzima',
    'services.eyebrow': 'Vinjari Huduma', 'services.title1': 'Wauzaji bora,', 'services.title2': 'waliothibitishwa',
    'services.sub': 'Kila mtaalamu amekaguliwa, amepitiwa na wanandoa halisi, na analipwa kwa mobile money.',
    'services.empty': 'Hakuna muuzaji anayelingana', 'services.emptySub': 'Jaribu kategoria au mkoa mwingine.', 'services.clear': 'Futa vichujio',
    'services.count': n => `Wauzaji ${n}`,
    'sort.recommended': 'Pendekezwa', 'sort.priceAsc': 'Bei: chini hadi juu', 'sort.priceDesc': 'Bei: juu hadi chini', 'sort.rating': 'Waliopimwa juu',
    'vendor.from': 'kuanzia', 'vendor.view': 'Ona', 'vendor.book': 'Hifadhi', 'vendor.verified': 'Amethibitishwa', 'vendor.pending': 'Anasubiri ukaguzi', 'vendor.reviews': n => `(${n})`,
    'planner.eyebrow': 'Mpangaji AI', 'planner.title1': 'Kutana na', 'planner.title2': 'mpangaji wako mahiri',
    'planner.sub': 'Bajeti, wauzaji, ratiba na hesabu za wageni — uliza chochote kuhusu siku yako kuu upate majibu yenye wauzaji halisi wa Tanzania.',
    'planner.f1t': 'Akili ya bajeti', 'planner.f1s': 'Mgawanyo mzuri kwa TZS, huhifadhiwa kwenye wasifu',
    'planner.f2t': 'Ulinganishaji wauzaji', 'planner.f2s': 'Kulingana na mkoa, mtindo na bei',
    'planner.f3t': 'Orodha hai', 'planner.f3s': 'Ratiba zinazoungana na dashibodi yako',
    'ai.smart': 'Mpangaji Mahiri', 'ai.online': 'Mtandaoni · hujibu papo hapo', 'ai.ph': 'Uliza kuhusu bajeti, ukumbi, ratiba...', 'ai.title': 'MY DAY AI',
    'ai.chip1': 'Gawa bajeti yangu', 'ai.chip2': 'Ukumbi Zanzibar', 'ai.chip3': 'Jenga orodha yangu', 'ai.chip4': 'Chakula kwa wageni 250',
    'dash.eyebrow': 'Dashibodi', 'dash.title1': 'Sherehe yako,', 'dash.title2': 'kwa mtazamo mmoja',
    'dash.search': 'Tafuta chochote...', 'dash.welcome': 'Karibu tena,', 'dash.welcomeSub': 'Huuu hapa muhtasari wa maendeleo ya harusi yako',
    'dash.stat1': 'Bajeti Iliyotumika', 'dash.stat2': 'Wageni Waliothibitisha', 'dash.stat3': 'Wauzaji Waliohifadhiwa',
    'dash.stat1sub': '↑ 12% kutoka mwezi uliopita', 'dash.stat2sub': n => `kati ya ${n} walioalikwa`, 'dash.stat3sub': n => `kati ya ${n} waliopangwa`,
    'dash.budget': 'Mgawanyo wa Bajeti', 'dash.used': 'imetumika', 'dash.weekly': 'Mipango ya Wiki',
    'dash.q1': 'Ongeza Kazi', 'dash.q1s': 'Kazi mpya', 'dash.q2': 'Alika', 'dash.q2s': 'Ushirikiano', 'dash.q3': 'Weka Lengo', 'dash.q3s': 'Fuatilia maendeleo', 'dash.q4': 'Ratiba', 'dash.q4s': 'Tarehe ya harusi',
    'dash.checklist': 'Orodha ya Mipango', 'dash.addTask': 'Ongeza kazi...', 'dash.countdown': 'Hesabu ya siku hadi siku kuu', 'dash.days': 'siku',
    'dash.countNote': (d, n) => d > 0 ? `${n} — kila wiki ni muhimu. Endelea na orodha!` : 'Siku kuu imefika. Hongera!',
    'range.month': 'Mwezi Huu', 'range.quarter': 'Miezi 3 Iliyopita', 'range.full': 'Mpango Kamili',
    'week.this': 'Wiki hii', 'week.last': 'Wiki iliyopita',
    'bookings.eyebrow': 'Uhifadhi Wangu', 'bookings.title1': 'Timu yako', 'bookings.title2': 'ya ndoto',
    'bookings.sub': 'Amana huhifadhiwa kwa usalama na hulipwa muuzaji baada ya tukio lako.',
    'bookings.empty': 'Hakuna uhifadhi bado', 'bookings.emptySub': 'Vinjari wauzaji waliothibitishwa uhifadhi wa kwanza.', 'bookings.cta': 'Tafuta wauzaji',
    'bookings.deposit': 'amana imelipwa', 'bookings.cancel': 'Ghairi', 'bookings.view': 'Ona', 'bookings.cancelled': 'Imeghairiwa', 'bookings.confirmed': 'Imethibitishwa', 'bookings.pending': 'Inasubiri',
    'bookings.cancelToast': 'Uhifadhi umeghairiwa', 'bookings.undo': 'Rudisha', 'bookings.restored': 'Uhifadhi umerudishwa',
    'profile.eyebrow': 'Wasifu wa Harusi', 'profile.title1': 'Tuambie kuhusu', 'profile.title2': 'siku yako',
    'profile.p1': 'Mpenzi 1', 'profile.p2': 'Mpenzi 2', 'profile.date': 'Tarehe ya harusi', 'profile.region': 'Mkoa', 'profile.budget': 'Bajeti (TZS)', 'profile.guests': 'Wageni walioalikwa', 'profile.confirmed': 'RSVP zilizothibitishwa', 'profile.theme': 'Mtindo wa sherehe', 'profile.save': 'Hifadhi wasifu', 'profile.saved': 'Wasifu umehifadhiwa — dashibodi imesasishwa',
    'profile.vision': (names, theme, region, date) => `${names} wanapanga sherehe ya ${theme.toLowerCase()} huko ${region} tarehe ${date}. Wauzaji na bajeti hapa chini zimeandaliwa kwa maono haya.`,
    'vendor.eyebrow': 'Kuwa Muuzaji', 'vendor.title1': 'Kukuza', 'vendor.title2': 'biashara yako ya harusi',
    'vendor.sub': 'Jiunge na soko la harusi linalokua kwa kasi zaidi Tanzania. Gunduliwa na wanandoa walio tayari kuhifadhi na kulipa kwa mobile money.',
    'vendor.s1': 'wanandoa wanapanga', 'vendor.s2': 'malipo kwa wakati', 'vendor.s3': 'ada ya kuorodhesha',
    'vendor.st1t': 'Omba kwa dakika', 'vendor.st1s': 'Tuambie kuhusu biashara na huduma zako.',
    'vendor.st2t': 'Thibitishwa', 'vendor.st2s': 'Timu yetu hukagua stakabadhi zako ndani ya saa 48.',
    'vendor.st3t': 'Pokea uhifadhi', 'vendor.st3s': 'Wanandoa huhifadhi na kulipa amana moja kwa moja.',
    'vendor.formTitle': 'Maombi ya muuzaji', 'vendor.name': 'Jina la biashara', 'vendor.price': 'Bei ya kuanzia (TZS)', 'vendor.phone': 'Simu ya biashara', 'vendor.desc': 'Eleza huduma zako', 'vendor.descPh': 'Nini kinaufanya huduma yako kuwa maalum?', 'vendor.mm': 'Mobile money inayokubaliwa', 'vendor.apply': 'Omba kuorodheshwa',
    'vendor.applied': 'Maombi yamepokelewa — orodha yako inasubiri ukaguzi', 'vendor.mmRequired': 'Chagua angalau mtoa huduma mmoja wa mobile money', 'vendor.badPhone': 'Weka nambari sahihi ya simu ya Tanzania',
    'footer.tag': 'Siku yako, imepangwa kwa uzuri — kutoka fukwe za Zanzibar hadi miteremko ya Kilimanjaro.',
    'footer.explore': 'Vinjari', 'footer.couples': 'Kwa wanandoa', 'footer.support': 'Msaada', 'footer.help': 'Kituo cha Msaada', 'footer.payments': 'Mobile Money', 'footer.made': 'Imetengenezwa kwa upendo Tanzania',
    'notif.title': 'Arifa', 'notif.read': 'Weka zote zimesomwa',
    'date.ph': 'Chagua tarehe', 'date.today': 'Leo', 'date.clear': 'Futa', 'date.prev': 'Mwezi uliopita', 'date.next': 'Mwezi ujao',
    'auth.loginTab': 'Ingia', 'auth.signupTab': 'Fungua akaunti',
    'auth.loginTitle': 'Karibu tena', 'auth.loginSub': 'Ingia kwenye akaunti yako ya majaribio katika kivinjari hiki.',
    'auth.signupTitle': 'Fungua akaunti yako', 'auth.signupSub': 'Jaribu akaunti katika kivinjari hiki. Tumia nenosiri la majaribio tu.',
    'role.title': 'Karibu MY DAY', 'role.sub': 'Ungependa kutumia MY DAY vipi?',
    'role.customerT': 'Napanga harusi', 'role.customerS': 'Gundua watoa huduma, panga harusi yako na simamia uhifadhi.', 'role.customerTag': 'Akaunti ya mteja',
    'role.vendorT': 'Ninatoa huduma za harusi', 'role.vendorS': 'Onyesha biashara yako, pokea uhifadhi na kukuza biashara yako.', 'role.vendorTag': 'Akaunti ya muuzaji',
    'role.adminNote': 'Akaunti za msimamizi zinaundwa ndani ya mfumo, kamwe kupitia usajili wa umma.',
    'role.chosen': r => `Unafungua kama: ${r}`, 'role.change': 'Badilisha', 'role.demo': 'Akaunti za majaribio', 'role.demoHint': 'Gusa kujaza',
    'vdash.title': 'Dashibodi ya biashara yako', 'vdash.status': 'Hali ya orodha', 'vdash.requests': 'Maombi ya uhifadhi', 'vdash.accept': 'Kubali', 'vdash.decline': 'Kataa',
    'vdash.escrow': 'Kwenye escrow', 'vdash.released': 'Imetolewa kwako', 'vdash.empty': 'Hakuna maombi mapya kwa sasa — wandoa watakupata hapa.',
    'vdash.pending': 'Inasubiri ukaguzi', 'vdash.verified': 'Imethibitishwa', 'vdash.suspended': 'Imesimamishwa', 'vdash.accepted': 'Ombi limekubaliwa — wandoa wamearifiwa.', 'vdash.declined': 'Ombi limekataliwa.',
    'nav.admin': 'Msimamizi', 'adm.eyebrow': 'Ufikiaji maalum', 'adm.title': 'Msimamizi wa Jukwaa',
    'adm.sub': 'Timu ya usimamizi wa jukwaa la MY DAY. Simamia wateja na wauzaji, thibitisha biashara, idhinisha au simamisha orodha, fuatilia uhifadhi na malipo, shughulikia malalamiko, kategoria na mikoa, takwimu na mipangilio.',
    'adm.overview': 'Muhtasari', 'adm.customers': 'Wateja', 'adm.vendors': 'Wauzaji', 'adm.bookings': 'Uhifadhi', 'adm.complaints': 'Malalamiko', 'adm.cats': 'Kategoria na Mikoa', 'adm.settings': 'Mipangilio',
    'adm.custCount': 'Akaunti za wateja', 'adm.vendorCount': 'Wauzaji walioorodheshwa', 'adm.bookCount': 'Uhifadhi', 'adm.gmv': 'Thamani ya uhifadhi', 'adm.verify': 'Thibitisha', 'adm.suspend': 'Simamisha', 'adm.restore': 'Rejesha',
    'adm.resolve': 'Maliza', 'adm.open': 'Wazi', 'adm.resolved': 'Imemalizwa', 'adm.addRegion': 'Ongeza mkoa', 'adm.remove': 'Ondoa', 'adm.escrowOn': 'Ulinzi wa escrow kwa amana',
    'adm.verifyReq': 'Uthibitisho unahitajika kabla ya kuorodhesha', 'adm.fee': 'Ada ya orodha (%)', 'adm.verified': 'Muuzaji amethibitishwa', 'adm.suspendedV': 'Muuzaji amesimamishwa', 'adm.restored': 'Muuzaji amerejeshwa',
    'adm.resolvedC': 'Lalamiko limemalizwa', 'adm.regionAdded': 'Mkoa umeongezwa', 'adm.regionRemoved': 'Mkoa umeondolewa', 'adm.noComplaints': 'Hakuna malalamiko — kila mtu yuko furaha.',
    'adm.couple': 'Wandoa', 'adm.vendor': 'Muuzaji', 'adm.amount': 'Kiasi', 'adm.status': 'Hali', 'adm.date': 'Tarehe', 'adm.email': 'Barua pepe', 'adm.role': 'Aina', 'adm.joined': 'Amejiunga',
    'auth.errUnavailable': 'Akaunti haipatikani sasa. Fungua majaribio kupitia localhost au HTTPS kisha ujaribu tena.',
    'auth.name': 'Jina kamili', 'auth.email': 'Barua pepe', 'auth.password': 'Nenosiri', 'auth.confirm': 'Thibitisha nenosiri', 'auth.newPass': 'Nenosiri jipya',
    'auth.forgot': 'Umesahau nenosiri?', 'auth.loginBtn': 'Ingia', 'auth.signupBtn': 'Fungua akaunti',
    'auth.noAccount': 'Mgeni kwenye MY DAY?', 'auth.haveAccount': 'Una akaunti tayari?',
    'auth.errName': 'Andika jina lako kamili', 'auth.errEmail': 'Andika barua pepe sahihi', 'auth.errPass': 'Tumia angalau herufi 8', 'auth.errMatch': 'Manenosiri hayafanani',
    'auth.errNoUser': 'Hakuna akaunti ya barua pepe hii — fungua mpya', 'auth.errWrongPass': 'Nenosiri si sahihi — jaribu tena au liweke upya', 'auth.errExists': 'Barua pepe hii ina akaunti tayari — ingia',
    'auth.welcome': n => `Karibu, ${n}! Umeingia.`, 'auth.created': n => `Akaunti imefunguliwa — karibu, ${n}!`, 'auth.logoutDone': 'Umetoka — tutaonana',
    'auth.forgotTitle': 'Weka upya nenosiri', 'auth.forgotSub': 'Andika barua pepe ya akaunti yako kupata msimbo wa majaribio. Hakuna barua pepe itakayotumwa.',
    'auth.sendCode': 'Pata msimbo wa majaribio', 'auth.backLogin': 'Rudi kuingia',
    'auth.codeTitle': 'Weka upya akaunti yako', 'auth.codeSub': e => `Tumia msimbo wa majaribio hapa chini kwa ${e}, kisha uchague nenosiri jipya la majaribio.`,
    'auth.demoInbox': 'Demo inbox', 'auth.demoNote': 'Toleo hili linakaa kwenye kifaa chako — barua pepe halisi haitumwi. Nambari yako:',
    'auth.code': 'Nambari ya kuweka upya', 'auth.resetBtn': 'Weka nenosiri jipya', 'auth.resend': 'Tuma tena', 'auth.resent': 'Nambari mpya ipo kwenye demo inbox',
    'auth.errCodeFmt': 'Andika nambari 6', 'auth.errCode': 'Nambari si sahihi au imeisha — tuma mpya',
    'auth.resetDone': 'Nenosiri limesasishwa', 'auth.resetDoneSub': 'Nenosiri jipya linatumika. Ingia uendelee kupanga.',
    'auth.resetNotif': 'Nenosiri lako la MY DAY limebadilishwa.', 'auth.welcomeNotif': n => `Karibu MY DAY, ${n}! Nafasi yako ya mipango iko tayari.`,
    'auth.showPass': 'Onyesha nenosiri', 'auth.hidePass': 'Ficha nenosiri', 'auth.memberSince': d => `Mwanachama tangu ${d}`,
    'modal.name': 'Jina lako', 'modal.email': 'Barua pepe', 'modal.logout': 'Toka', 'modal.account': 'Akaunti yako', 'modal.loggedIn': 'Umeingia kama',
    'modal.bookTitle': 'Hifadhi', 'modal.bookSub': 'Lipa amana ya 30% kwa mobile money. Salio hulipwa baada ya tukio lako.',
    'modal.package': 'Kifurushi', 'modal.date': 'Tarehe ya tukio', 'modal.guests': 'Wageni', 'modal.provider': 'Lipa kwa', 'modal.phone': 'Nambari ya mobile money',
    'modal.total': 'Jumla', 'modal.deposit': 'Amana sasa (30%)', 'modal.balance': 'Salio baada ya tukio', 'modal.pay': 'Lipa amana', 'modal.processing': 'Inatuma ombi la malipo...',
    'modal.successTitle': 'Uhifadhi umethibitishwa!', 'modal.successSub': 'Ombi la malipo limetumwa kwa simu yako. Muuzaji amearifiwa.',
    'modal.viewBookings': 'Ona uhifadhi wangu', 'modal.done': 'Imekamilika', 'modal.badPhone': 'Weka nambari sahihi, mfano 0712 345 678',
    'modal.taskTitle': 'Ongeza kazi', 'modal.taskSub': 'Itaonekana kwenye orodha yako ya mipango.', 'modal.taskLabel': 'Kazi', 'modal.add': 'Ongeza kazi',
    'modal.inviteTitle': 'Alika mshirika', 'modal.inviteSub': 'Pangeni pamoja — wenzi na familia wanaweza kufuatilia maendeleo.', 'modal.inviteBtn': 'Tuma mwaliko', 'modal.invited': n => `${n} amealikwa kupanga nawe`,
    'modal.goalTitle': 'Weka lengo', 'modal.goalSub': 'Malengo huweka mipango yako kwenye njia.', 'modal.goalLabel': 'Lengo', 'modal.goalTarget': 'Lengo', 'modal.goalBtn': 'Weka lengo',
    'modal.scheduleTitle': 'Tarehe ya harusi', 'modal.scheduleSub': 'Hesabu yako na ratiba husasishwa papo hapo.', 'modal.scheduleBtn': 'Hifadhi tarehe', 'modal.scheduled': 'Tarehe ya harusi imesasishwa',
    'modal.payTitle': 'Mobile money kwenye MY DAY', 'modal.paySub': 'Kila uhifadhi umelindwa. Amana huhifadhiwa na hulipwa muuzaji baada ya tukio. Tunakubali M-Pesa, Tigo Pesa, Airtel Money na HaloPesa — hakuna kadi wala benki.',
    'task.added': 'Kazi imeongezwa kwenye orodha', 'task.deleted': 'Kazi imefutwa', 'task.restored': 'Kazi imerudishwa',
    'goal.added': 'Lengo limeongezwa', 'goal.done': 'Lengo limekamilika — hongera!',
    'chat.welcome': 'Habari! Mimi ni mpangaji wako wa MY DAY. Ninaweza kugawa bajeti, kukuunganisha na wauzaji waliothibitishwa, kujenga orodha yako na kuhesabu wageni. Tupange nini leo?',
    'chat.viewAll': 'Vinjari wote', 'chat.saveBudget': 'Hifadhi kama bajeti yangu', 'chat.budgetSaved': 'Bajeti imehifadhiwa kwenye wasifu', 'chat.addChecklist': 'Ongeza kwenye orodha', 'chat.checklistAdded': 'Orodha imesasishwa — ona dashibodi',
    'cat.Venues': 'Ukumbi', 'cat.Photography': 'Upigaji Picha', 'cat.Decor & Florals': 'Mapambo na Maua', 'cat.Catering': 'Chakula', 'cat.MC & Entertainment': 'MC na Burudani', 'cat.Music & DJ': 'Muziki na DJ', 'cat.Beauty & Henna': 'Urembo na Henna', 'cat.Transport': 'Usafiri',
    'reg.Dar es Salaam': 'Dar es Salaam', 'reg.Zanzibar': 'Zanzibar', 'reg.Arusha': 'Arusha', 'reg.Mwanza': 'Mwanza', 'reg.Dodoma': 'Dodoma', 'reg.Moshi': 'Moshi',
    'theme.Coastal': 'Pwani', 'theme.Garden': 'Bustani', 'theme.Traditional': 'Kiasili', 'theme.Modern': 'Kisasa', 'theme.Destination': 'Safari',
    'months': ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
    'monthsFull': ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
    'days': ['Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jms', 'Jpl'],
    'budget.venue': 'Ukumbi', 'budget.catering': 'Chakula', 'budget.decor': 'Mapambo', 'budget.photo': 'Picha na Video', 'budget.music': 'Muziki na MC', 'budget.attire': 'Mavazi na Urembo',
  }
};

/* ---------------- seed data ---------------- */
const CATEGORIES = ['Venues', 'Photography', 'Decor & Florals', 'Catering', 'MC & Entertainment', 'Music & DJ', 'Beauty & Henna', 'Transport'];
const REGIONS = ['Dar es Salaam', 'Zanzibar', 'Arusha', 'Mwanza', 'Dodoma', 'Moshi'];
const THEMES = ['Coastal', 'Garden', 'Traditional', 'Modern', 'Destination'];
const MM_PROVIDERS = ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'HaloPesa'];
const CAT_IMG = { 'Venues': 'assets/venue-beach.jpg', 'Photography': 'assets/photo-kiss.jpg', 'Decor & Florals': 'assets/decor-table.jpg', 'Catering': 'assets/catering-buffet.jpg', 'MC & Entertainment': 'assets/mc-mic.jpg', 'Music & DJ': 'assets/band-stage.jpg', 'Beauty & Henna': 'assets/beauty-makeup.jpg', 'Transport': 'assets/car-luxury.jpg' };

const seedVendors = () => ([
  { id: 'v1', name: 'Zanzi Pearl Beach Resort', category: 'Venues', region: 'Zanzibar', price: 8500000, rating: 4.9, reviews: 128, img: 'assets/venue-beach.jpg', verified: true, mm: ['M-Pesa', 'Tigo Pesa', 'Airtel Money'], desc: 'Private white-sand beachfront on Kendwa bay. Ceremonies at sunset, receptions under the stars, and a dedicated wedding coordinator for every couple.', amenities: ['Beachfront', 'Bridal suite', 'In-house catering', 'Sunset deck', 'Accommodation', 'Generator backup'], packages: [{ name: 'Intimate Ceremony', price: 8500000, desc: 'Up to 80 guests · beach arch & seating' }, { name: 'Signature Wedding', price: 14500000, desc: 'Up to 250 guests · full beach & deck' }, { name: 'Full Buyout', price: 24000000, desc: 'Exclusive resort · 2 days · 40 rooms' }] },
  { id: 'v2', name: 'Kili Garden Estate', category: 'Venues', region: 'Arusha', price: 6200000, rating: 4.8, reviews: 94, img: 'assets/venue-garden.jpg', verified: true, mm: ['M-Pesa', 'Airtel Money'], desc: 'A greenhouse pavilion wrapped in tropical gardens with Kilimanjaro views. Hanging candlelight, long banquet tables and golden-hour lawns.', amenities: ['Garden lawns', 'Glass pavilion', 'Bridal cottage', 'Parking', 'Fire pit lounge'], packages: [{ name: 'Garden Ceremony', price: 6200000, desc: 'Up to 120 guests · lawn & arch' }, { name: 'Pavilion Reception', price: 9800000, desc: 'Up to 300 guests · full pavilion' }, { name: 'Estate Weekend', price: 16000000, desc: '2 days · cottage & gardens' }] },
  { id: 'v3', name: 'Simba Grand Ballroom', category: 'Venues', region: 'Dar es Salaam', price: 7400000, rating: 4.7, reviews: 156, img: 'assets/venue-ballroom.jpg', verified: true, mm: ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'HaloPesa'], desc: 'Crystal chandeliers, gold chiavari seating and a grand stage in the heart of Dar. Climate-controlled, with valet and full AV production.', amenities: ['Crystal hall', 'Stage & AV', 'Valet parking', 'Bridal room', 'Security', 'Air conditioning'], packages: [{ name: 'Classic Hall', price: 7400000, desc: 'Up to 300 guests · hall only' }, { name: 'Grand Production', price: 12500000, desc: 'Up to 600 guests · AV & lighting' }, { name: 'Royal Package', price: 19000000, desc: 'Full hall · decor · coordination' }] },
  { id: 'v4', name: 'Savannah Lens Studios', category: 'Photography', region: 'Dar es Salaam', price: 2800000, rating: 4.9, reviews: 211, img: 'assets/photo-kiss.jpg', verified: true, mm: ['M-Pesa', 'Tigo Pesa'], desc: 'Editorial wedding photography and cinematic films. Two shooters, drone coverage and a same-day highlight reel that guests replay all night.', amenities: ['2 photographers', 'Drone', 'Same-day edit', 'Online gallery', 'Printed album'], packages: [{ name: 'Essentials', price: 2800000, desc: '8 hours · 2 shooters · gallery' }, { name: 'Signature Film', price: 4600000, desc: 'Full day · drone · highlight film' }, { name: 'Luxury Story', price: 7200000, desc: '2 days · album · feature film' }] },
  { id: 'v5', name: 'Mosaic Films', category: 'Photography', region: 'Moshi', price: 3100000, rating: 4.8, reviews: 102, img: 'assets/photo-bouquet.jpg', verified: true, mm: ['M-Pesa', 'Airtel Money'], desc: 'Moody, fine-art coverage for couples who love the mountains. Elopements on Kilimanjaro slopes, coffee-farm portraits and timeless albums.', amenities: ['Fine-art edits', 'Elopement expert', 'Album design', 'Travel included'], packages: [{ name: 'Portrait Day', price: 3100000, desc: '6 hours · 1 shooter · gallery' }, { name: 'Wedding Story', price: 5200000, desc: 'Full day · 2 shooters · album' }, { name: 'Mountain Elopement', price: 6800000, desc: '2 days · slopes & farms' }] },
  { id: 'v6', name: 'Petal & Protea Décor', category: 'Decor & Florals', region: 'Dar es Salaam', price: 3400000, rating: 4.7, reviews: 76, img: 'assets/decor-table.jpg', verified: true, mm: ['M-Pesa', 'Tigo Pesa', 'HaloPesa'], desc: 'Tropical tablescapes with heliconias, garden roses and gold-rimmed glassware. Full styling from aisle to sweetheart table, installed before you arrive.', amenities: ['Fresh florals', 'Table styling', 'Lighting design', 'Setup & teardown'], packages: [{ name: 'Accent Styling', price: 3400000, desc: 'Aisle + 10 centerpieces' }, { name: 'Full Tablescape', price: 6100000, desc: 'Up to 25 tables · linens & glass' }, { name: 'Total Transform', price: 10500000, desc: 'Venue-wide design & lighting' }] },
  { id: 'v7', name: 'Aisle & Arbor', category: 'Decor & Florals', region: 'Arusha', price: 2600000, rating: 4.8, reviews: 63, img: 'assets/decor-aisle.jpg', verified: true, mm: ['M-Pesa', 'Airtel Money'], desc: 'Ceremony specialists: rose-sphere aisles, draped arches and petal carpets. Garden weddings are our love language.', amenities: ['Ceremony arches', 'Rose spheres', 'Petal aisle', 'Drapery'], packages: [{ name: 'Ceremony Arch', price: 2600000, desc: 'Arch + aisle markers' }, { name: 'Grand Aisle', price: 4300000, desc: 'Spheres, drapes & petals' }, { name: 'Garden Complete', price: 7000000, desc: 'Ceremony + reception florals' }] },
  { id: 'v8', name: 'Swahili Feast Catering', category: 'Catering', region: 'Zanzibar', price: 1900000, rating: 4.8, reviews: 143, img: 'assets/catering-buffet.jpg', verified: true, mm: ['M-Pesa', 'Tigo Pesa', 'Airtel Money'], desc: 'Spice-island feasts: biryani stations, grilled seafood, pilau and tropical desserts. Price is per 100 guests, served on polished chafing displays.', amenities: ['Live stations', 'Halal certified', 'Service staff', 'Dessert bar', 'Per 100 guests'], perHead: true, packages: [{ name: 'Classic Buffet', price: 1900000, desc: 'Per 100 guests · 4 mains' }, { name: 'Spice Journey', price: 2700000, desc: 'Per 100 guests · 6 mains + live station' }, { name: 'Royal Feast', price: 3600000, desc: 'Per 100 guests · seafood & dessert bar' }] },
  { id: 'v9', name: "MC Juma 'The Voice'", category: 'MC & Entertainment', region: 'Dar es Salaam', price: 1200000, rating: 4.9, reviews: 167, img: 'assets/mc-mic.jpg', verified: true, mm: ['M-Pesa', 'Tigo Pesa', 'HaloPesa'], desc: 'Bilingual MC (Kiswahili & English) with 400+ weddings. Reads the room, keeps the timeline tight, and turns your reception into a celebration.', amenities: ['Bilingual', 'Timeline planning', 'Crowd games', 'Sound check included'], packages: [{ name: 'Reception MC', price: 1200000, desc: '5 hours · reception' }, { name: 'Full Day MC', price: 1900000, desc: 'Ceremony + reception' }, { name: 'MC + Sound', price: 2600000, desc: 'Full day · PA system' }] },
  { id: 'v10', name: 'Coastal Beats Band', category: 'Music & DJ', region: 'Zanzibar', price: 2200000, rating: 4.7, reviews: 58, img: 'assets/band-stage.jpg', verified: true, mm: ['M-Pesa', 'Airtel Money'], desc: 'Live taarab-fusion band by day, DJ and sax by night. From processional strings to midnight sing-alongs — one crew, whole celebration.', amenities: ['Live band', 'DJ set', 'Saxophone', 'Lighting rig'], packages: [{ name: 'DJ & Sax', price: 2200000, desc: '6 hours · dance floor' }, { name: 'Band + DJ', price: 3900000, desc: 'Live set + DJ afterparty' }, { name: 'Full Production', price: 5800000, desc: 'Band, DJ, lights & sound' }] },
  { id: 'v11', name: 'Nuru Bridal Beauty', category: 'Beauty & Henna', region: 'Mwanza', price: 850000, rating: 4.8, reviews: 89, img: 'assets/beauty-makeup.jpg', verified: true, mm: ['M-Pesa', 'Tigo Pesa', 'Airtel Money'], desc: 'Bridal makeup, gele and intricate henna for the whole party. Long-wear looks tested for tropical heat, with trials before the big day.', amenities: ['Bridal trial', 'Henna art', 'Party packages', 'Travel to venue'], packages: [{ name: 'Bride Only', price: 850000, desc: 'Trial + wedding day look' }, { name: 'Bride + 4', price: 1600000, desc: 'Bride & 4 party members' }, { name: 'Full Party', price: 2900000, desc: 'Up to 10 · henna included' }] },
  { id: 'v12', name: 'Prestige Wedding Cars', category: 'Transport', region: 'Dar es Salaam', price: 950000, rating: 4.6, reviews: 41, img: 'assets/car-luxury.jpg', verified: true, mm: ['M-Pesa', 'HaloPesa'], desc: 'Chauffeured luxury coupes and SUVs, ribbon-dressed to your palette. Airport runs, photo-route cruises and guest shuttles.', amenities: ['Chauffeur', 'Ribbon styling', 'Photo routes', 'Guest shuttles'], packages: [{ name: 'Couple Car', price: 950000, desc: 'Luxury coupe · 6 hours' }, { name: 'Couple + Convoy', price: 2100000, desc: 'Coupe + 2 SUVs' }, { name: 'Guest Shuttle', price: 3200000, desc: '2 vans · full day loops' }] },
]);

const seedState = () => ({
  lang: 'en', theme: 'light', user: null, accounts: [],
  profile: { p1: 'Amina', p2: 'Daniel', date: '2027-03-20', region: 'Zanzibar', budget: 27000000, budgetUsed: 18360000, guests: 250, confirmed: 184, theme: 'Coastal' },
  vendors: seedVendors(),
  bookings: [
    { id: 'b1', vendorId: 'v1', pkg: 1, date: '2027-03-20', guests: 250, provider: 'M-Pesa', phone: '0712 345 678', total: 14500000, deposit: 4350000, status: 'confirmed', ts: Date.now() - 86400000 * 6 },
    { id: 'b2', vendorId: 'v4', pkg: 1, date: '2027-03-20', guests: 250, provider: 'Tigo Pesa', phone: '0712 345 678', total: 4600000, deposit: 1380000, status: 'confirmed', ts: Date.now() - 86400000 * 3 },
  ],
  tasks: [
    { id: 't1', label: 'Set the wedding budget', done: true },
    { id: 't2', label: 'Choose the wedding date', done: true },
    { id: 't3', label: 'Book ceremony & reception venue', done: true },
    { id: 't4', label: 'Book photographer & film team', done: true },
    { id: 't5', label: 'Send save-the-dates', done: true },
    { id: 't6', label: 'Book MC & entertainment', done: false },
    { id: 't7', label: 'Finalize catering menu & tasting', done: false },
    { id: 't8', label: 'Order wedding attire & henna session', done: false },
  ],
  goals: [{ id: 'g1', label: 'Book all key vendors', target: 12, current: 2 }],
  collaborators: ['Daniel'],
  notifications: [
    { id: 'n1', icon: 'heart', en: 'Zanzi Pearl Beach Resort confirmed your deposit — asante!', sw: 'Zanzi Pearl Beach Resort imethibitisha amana yako — asante!', ten: '2h ago', tsw: 'saa 2 zilizopita', unread: true },
    { id: 'n2', icon: 'sparkles', en: '3 new verified vendors joined in Zanzibar this week.', sw: 'Wauzaji 3 wapya waliothibitishwa Zanzibar wiki hii.', ten: '1d ago', tsw: 'siku 1 iliyopita', unread: true },
    { id: 'n3', icon: 'calendar', en: 'Your wedding is 128 days away. 3 checklist items need attention.', sw: 'Harusi yako ni baada ya siku 128. Kazi 3 zinahitaji umakini.', ten: '2d ago', tsw: 'siku 2 zilizopita', unread: true },
  ],
  range: 'full', week: 'this',
  weekThis: [3, 5, 2, 6, 4, 7, 5], weekLast: [2, 4, 3, 5, 6, 3, 4],
  spend: { month: { labels: ['W1', 'W2', 'W3', 'W4'], values: [15.2, 16.1, 17.0, 18.36] }, quarter: { labels: ['Sep', 'Oct', 'Nov'], values: [8.9, 12.6, 18.36] }, full: { labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'], values: [2.1, 5.4, 8.9, 12.6, 15.8, 18.36] } },
});

let state;
try { state = JSON.parse(localStorage.getItem('myday-v1')) || seedState(); if (!state.vendors || !state.profile) state = seedState(); }
catch { state = seedState(); }
if (!state.accounts) state.accounts = [];
if (!state.regions) state.regions = [...REGIONS];
if (!state.vendorRequests) state.vendorRequests = [
  { id: 'vr1', couple: 'Amina & Daniel', service: 'Full-day photography', serviceSw: 'Picha siku nzima', date: '2027-03-20', guests: 250, deposit: 1350000, status: 'new' },
  { id: 'vr2', couple: 'Neema & Brian', service: 'Half-day coverage', serviceSw: 'Nusu siku', date: '2026-12-12', guests: 120, deposit: 600000, status: 'new' },
];
if (!state.complaints) state.complaints = [
  { id: 'cp1', who: 'couple@myday.co.tz', en: 'Deposit released late for a confirmed booking.', sw: 'Amana ilitolewa kuchelewa kwa uhifadhi uliothibitishwa.', status: 'open' },
  { id: 'cp2', who: 'neema@example.com', en: 'Vendor changed package price after booking.', sw: 'Muuzaji alibadilisha bei ya pakiti baada ya uhifadhi.', status: 'open' },
];
if (!state.settings) state.settings = { escrow: true, verifyReq: true, fee: 0 };
const save = () => { try { localStorage.setItem('myday-v1', JSON.stringify(state)); } catch {} };
const t = (k, ...args) => { const v = (I18N[state.lang] && I18N[state.lang][k]) ?? I18N.en[k] ?? k; return typeof v === 'function' ? v(...args) : v; };
const catT = c => t('cat.' + c);
const regT = r => t('reg.' + r);
const fmtDate = iso => { const d = new Date(iso + 'T00:00:00'); if (isNaN(d)) return iso; return `${d.getDate()} ${t('months')[d.getMonth()]} ${d.getFullYear()}`; };
const daysToWedding = () => Math.max(0, Math.ceil((new Date(state.profile.date + 'T00:00:00') - new Date().setHours(0, 0, 0, 0)) / 86400000));

/* ---------------- filters ---------------- */
const filters = { q: '', category: '', region: '', sort: 'recommended', date: '' };

function filteredVendors() {
  let list = [...state.vendors];
  const q = filters.q.trim().toLowerCase();
  if (filters.category) list = list.filter(v => v.category === filters.category);
  if (filters.region) list = list.filter(v => v.region === filters.region);
  if (q) list = list.filter(v => [v.name, v.category, v.region, v.desc, catT(v.category), regT(v.region), ...(v.amenities || [])].join(' ').toLowerCase().includes(q));
  if (filters.sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
  else if (filters.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  else list.sort((a, b) => (b.rating * Math.log(b.reviews + 1)) - (a.rating * Math.log(a.reviews + 1)));
  return list;
}

function stars(r) { let s = ''; for (let i = 1; i <= 5; i++) s += `<svg class="ic" style="opacity:${r >= i - .25 ? 1 : .28}"><use href="#i-star"/></svg>`; return `<span class="stars">${s}</span>`; }

function renderVendors() {
  const list = filteredVendors();
  $('#resultCount').textContent = t('services.count', list.length);
  $('#noResults').classList.toggle('hidden', list.length > 0);
  $('#vendorGrid').innerHTML = list.map(v => `
    <article class="vendor-card glass" data-id="${v.id}">
      <div class="vc-photo">
        <img src="${v.img}" alt="${esc(v.name)}" loading="lazy">
        <span class="vc-cat">${esc(catT(v.category))}</span>
        ${v.pending ? `<span class="vc-pending">${t('vendor.pending')}</span>` : v.verified ? `<span class="vc-verified">${icon('shield')}${t('vendor.verified')}</span>` : ''}
      </div>
      <div class="vc-body">
        <div class="vc-name">${esc(v.name)}</div>
        <div class="vc-region">${icon('pin')}${esc(regT(v.region))}</div>
        <div class="vc-rating">${stars(v.rating)}<strong>${v.rating ? v.rating.toFixed(1) : '—'}</strong><span>${t('vendor.reviews', v.reviews)}</span></div>
        <div class="vc-price"><small>${t('vendor.from')}</small><strong>${fmtM(v.price)}</strong>${v.perHead ? `<small>/ 100 ${state.lang === 'sw' ? 'wageni' : 'guests'}</small>` : ''}</div>
        <div class="vc-actions">
          <button type="button" class="btn btn-glass" data-action="view" data-id="${v.id}">${t('vendor.view')}</button>
          <button type="button" class="btn btn-primary" data-action="book" data-id="${v.id}" ${v.pending ? 'disabled' : ''}>${t('vendor.book')}</button>
        </div>
      </div>
    </article>`).join('');
}

function renderChips() {
  $('#catChips').innerHTML = ['', ...CATEGORIES].map(c =>
    `<button type="button" class="chip ${filters.category === c ? 'active' : ''}" data-cat="${esc(c)}">${c ? esc(catT(c)) : (state.lang === 'sw' ? 'Zote' : 'All')}</button>`).join('');
}

function fillSelect(sel, options, current, allLabel) {
  sel.innerHTML = (allLabel != null ? `<option value="">${allLabel}</option>` : '') + options.map(o => `<option value="${esc(o.value ?? o)}" ${String(o.value ?? o) === String(current) ? 'selected' : ''}>${esc(o.label ?? o)}</option>`).join('');
  if (sel._gsSync) sel._gsSync();
}

/* ---------------- glass pickers ---------------- */
let openPop = null;
function closePop() {
  if (!openPop) return;
  if (openPop.panel.contains(document.activeElement)) openPop.trigger.focus();
  openPop.wrap.classList.remove('pop-open');
  openPop.panel.classList.remove('open');
  openPop.trigger.setAttribute('aria-expanded', 'false');
  openPop = null;
}
function placePanel(panel, trig, minW) {
  panel.classList.add('open');
  const r = trig.getBoundingClientRect();
  const w = Math.min(Math.max(minW, r.width), innerWidth - 16);
  panel.style.width = w + 'px';
  panel.style.maxHeight = (panel.classList.contains('gs-panel') ? Math.min(290, innerHeight - 16) : innerHeight - 16) + 'px';
  const h = panel.offsetHeight;
  let left = Math.min(Math.max(8, r.left), innerWidth - w - 8);
  let top = r.bottom + 8;
  if (top + h > innerHeight - 8) top = Math.max(8, Math.min(r.top - h - 8, innerHeight - h - 8));
  panel.style.left = left + 'px';
  panel.style.top = top + 'px';
}
function enhanceSelect(sel) {
  if (sel.dataset.gs) return;
  sel.dataset.gs = '1';
  const wrap = sel.closest('.select-wrap') || sel.parentElement;
  wrap.classList.add('gs-on');
  sel.classList.add('gs-native');
  sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
  const trig = document.createElement('button');
  trig.type = 'button'; trig.className = 'gs-trigger';
  trig.setAttribute('aria-haspopup', 'listbox'); trig.setAttribute('aria-expanded', 'false');
  trig.innerHTML = `<span class="gs-value"></span>${icon('chev', 'ic gs-chev')}`;
  wrap.appendChild(trig);
  const panel = document.createElement('div');
  panel.className = 'gs-panel glass-thick'; panel.setAttribute('role', 'listbox');
  panel._owner = sel;
  document.body.appendChild(panel);
  const sync = () => {
    const opt = sel.options[sel.selectedIndex];
    trig.querySelector('.gs-value').textContent = opt ? opt.textContent : '';
    trig.setAttribute('aria-label', opt ? opt.textContent : '');
    panel.innerHTML = [...sel.options].map((o, i) => `<button type="button" role="option" class="gs-opt ${i === sel.selectedIndex ? 'selected' : ''}" aria-selected="${i === sel.selectedIndex}" data-i="${i}"><span>${esc(o.textContent)}</span>${icon('check', 'ic gs-check')}</button>`).join('');
  };
  sel._gsSync = sync; sync();
  const open = () => {
    closePop(); sync();
    wrap.classList.add('pop-open'); trig.setAttribute('aria-expanded', 'true');
    openPop = { wrap, panel, trigger: trig, minW: 230 };
    placePanel(panel, trig, 230);
    (panel.querySelector('.gs-opt.selected') || panel.firstElementChild).focus();
  };
  trig.addEventListener('click', () => wrap.classList.contains('pop-open') ? closePop() : open());
  trig.addEventListener('keydown', e => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); if (!wrap.classList.contains('pop-open')) open(); }
  });
  panel.addEventListener('click', e => {
    const b = e.target.closest('.gs-opt'); if (!b) return;
    sel.selectedIndex = +b.dataset.i; sync();
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    closePop(); trig.focus();
  });
  panel.addEventListener('keydown', e => {
    const opts = [...panel.querySelectorAll('.gs-opt')];
    const i = opts.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (opts[i + 1] || opts[0]).focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (opts[i - 1] || opts[opts.length - 1]).focus(); }
    else if (e.key === 'Home') { e.preventDefault(); opts[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); opts[opts.length - 1].focus(); }
    else if (e.key === 'Tab') closePop();
  });
}
const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function enhanceDate(inp) {
  if (inp.dataset.gd) return;
  inp.dataset.gd = '1';
  const field = inp.closest('.field') || inp.closest('.search-field') || inp.parentElement;
  field.classList.add('gd-on');
  inp.classList.add('gd-native');
  inp.tabIndex = -1; inp.setAttribute('aria-hidden', 'true');
  const trig = document.createElement('button');
  trig.type = 'button'; trig.className = 'gd-trigger';
  trig.setAttribute('aria-haspopup', 'dialog'); trig.setAttribute('aria-expanded', 'false');
  trig.innerHTML = `<span class="gd-value"></span>${icon('calendar', 'ic gd-ic')}`;
  field.appendChild(trig);
  const panel = document.createElement('div');
  panel.className = 'gd-panel glass-thick'; panel.setAttribute('role', 'dialog');
  panel._owner = inp;
  document.body.appendChild(panel);
  let view = null;
  const sync = () => {
    trig.querySelector('.gd-value').textContent = inp.value ? fmtDate(inp.value) : t('date.ph');
    trig.classList.toggle('gd-empty', !inp.value);
    trig.setAttribute('aria-label', `${field.querySelector('label')?.textContent || t('date.ph')}: ${trig.textContent.trim()}`);
    trig.removeAttribute('aria-invalid');
  };
  inp._gdSync = sync; sync();
  inp.addEventListener('invalid', e => { e.preventDefault(); trig.setAttribute('aria-invalid', 'true'); trig.focus(); if (!field.classList.contains('pop-open')) trig.click(); });
  const render = () => {
    const { y, m } = view;
    const start = (new Date(y, m, 1).getDay() + 6) % 7;
    const today = isoDate(new Date());
    panel.innerHTML = `
      <div class="gd-head">
        <button type="button" class="icon-btn gd-nav" data-nav="-1" aria-label="${t('date.prev')}">${icon('chev', 'ic gd-prev')}</button>
        <strong>${t('monthsFull')[m]} ${y}</strong>
        <button type="button" class="icon-btn gd-nav" data-nav="1" aria-label="${t('date.next')}">${icon('chev', 'ic gd-next')}</button>
      </div>
      <div class="gd-week">${t('days').map(d => `<span>${d}</span>`).join('')}</div>
      <div class="gd-grid">${Array.from({ length: 42 }, (_, i) => {
        const d = new Date(y, m, i - start + 1); const di = isoDate(d); const out = d.getMonth() !== m;
        return `<button type="button" class="gd-day ${out ? 'out' : ''} ${di === today ? 'today' : ''} ${di === inp.value ? 'selected' : ''}" data-date="${di}" ${out ? 'tabindex="-1"' : ''}>${d.getDate()}</button>`;
      }).join('')}</div>
      <div class="gd-foot"><button type="button" class="gd-link" data-today>${t('date.today')}</button>${inp.required ? '' : `<button type="button" class="gd-link" data-clear>${t('date.clear')}</button>`}</div>`;
  };
  const open = () => {
    closePop();
    const base = inp.value ? new Date(inp.value + 'T00:00:00') : new Date();
    view = { y: base.getFullYear(), m: base.getMonth() };
    render();
    field.classList.add('pop-open'); trig.setAttribute('aria-expanded', 'true');
    openPop = { wrap: field, panel, trigger: trig, minW: 300 };
    placePanel(panel, trig, 300);
    (panel.querySelector('.gd-day.selected') || panel.querySelector('.gd-day.today') || panel.querySelector('.gd-day:not(.out)')).focus();
  };
  trig.addEventListener('click', () => field.classList.contains('pop-open') ? closePop() : open());
  trig.addEventListener('keydown', e => {
    if (['ArrowDown', 'Enter', ' '].includes(e.key)) { e.preventDefault(); if (!field.classList.contains('pop-open')) open(); }
  });
  panel.addEventListener('click', e => {
    e.stopPropagation();
    const nav = e.target.closest('[data-nav]');
    if (nav) { view.m += +nav.dataset.nav; if (view.m < 0) { view.m = 11; view.y--; } if (view.m > 11) { view.m = 0; view.y++; } render(); return; }
    if (e.target.closest('[data-today]')) { inp.value = isoDate(new Date()); sync(); inp.dispatchEvent(new Event('change', { bubbles: true })); closePop(); trig.focus(); return; }
    if (e.target.closest('[data-clear]')) { inp.value = ''; sync(); inp.dispatchEvent(new Event('change', { bubbles: true })); closePop(); trig.focus(); return; }
    const day = e.target.closest('.gd-day');
    if (day && !day.classList.contains('out')) { inp.value = day.dataset.date; sync(); inp.dispatchEvent(new Event('change', { bubbles: true })); closePop(); trig.focus(); }
  });
  panel.addEventListener('keydown', e => {
    const days = [...panel.querySelectorAll('.gd-day:not(.out)')];
    const i = days.indexOf(document.activeElement);
    if (e.key === 'Tab') { closePop(); return; }
    if (i < 0) return;
    const move = n => { e.preventDefault(); (days[i + n] || days[i]).focus(); };
    if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowLeft') move(-1);
    else if (e.key === 'ArrowDown') move(7);
    else if (e.key === 'ArrowUp') move(-7);
  });
}
function enhancePickers(root) {
  $$('body > .gs-panel, body > .gd-panel').forEach(p => { if (!p._owner.isConnected) p.remove(); });
  $$('select', root).forEach(enhanceSelect);
  $$('input[type="date"]', root).forEach(enhanceDate);
}
document.addEventListener('click', e => { if (openPop && !openPop.wrap.contains(e.target) && !openPop.panel.contains(e.target)) closePop(); });
addEventListener('scroll', e => { if (openPop && !openPop.panel.contains(e.target)) closePop(); }, { passive: true, capture: true });
addEventListener('resize', () => { if (openPop) placePanel(openPop.panel, openPop.trigger, openPop.minW); });

function renderSelects() {
  fillSelect($('#fCategory'), CATEGORIES.map(c => ({ value: c, label: catT(c) })), filters.category, t('search.allCats'));
  fillSelect($('#fRegion'), state.regions.map(r => ({ value: r, label: regT(r) })), filters.region, t('search.allRegions'));
  fillSelect($('#sortSel'), [{ value: 'recommended', label: t('sort.recommended') }, { value: 'priceAsc', label: t('sort.priceAsc') }, { value: 'priceDesc', label: t('sort.priceDesc') }, { value: 'rating', label: t('sort.rating') }], filters.sort);
  fillSelect($('#rangeSel'), [{ value: 'month', label: t('range.month') }, { value: 'quarter', label: t('range.quarter') }, { value: 'full', label: t('range.full') }], state.range);
  fillSelect($('#weekSel'), [{ value: 'this', label: t('week.this') }, { value: 'last', label: t('week.last') }], state.week);
  fillSelect($('#pRegion'), state.regions.map(r => ({ value: r, label: regT(r) })), state.profile.region);
  fillSelect($('#vCategory'), CATEGORIES.map(c => ({ value: c, label: catT(c) })), 'Venues');
  fillSelect($('#vRegion'), state.regions.map(r => ({ value: r, label: regT(r) })), 'Dar es Salaam');
  $('#themeChips').innerHTML = THEMES.map(th => `<button type="button" class="chip ${state.profile.theme === th ? 'active' : ''}" data-theme="${th}">${t('theme.' + th)}</button>`).join('');
}

/* ---------------- dashboard ---------------- */
function budgetPct() { return Math.min(100, Math.round(state.profile.budgetUsed / state.profile.budget * 100)); }
const confirmedBookings = () => state.bookings.filter(b => b.status === 'confirmed').length;

function renderStats() {
  $('#statBudget').textContent = budgetPct() + '%';
  $('#statBudgetSub').textContent = t('dash.stat1sub');
  $('#statGuests').textContent = state.profile.confirmed.toLocaleString();
  $('#statGuestsSub').textContent = t('dash.stat2sub', state.profile.guests);
  $('#statVendors').textContent = confirmedBookings();
  $('#statVendorsSub').textContent = t('dash.stat3sub', 12);
  $('#wcName').textContent = state.user ? state.user.name.split(' ')[0] : state.profile.p1;
  const d = daysToWedding();
  $('#countDays').textContent = d;
  $('#countDate').textContent = fmtDate(state.profile.date);
  $('#countNames').textContent = `${state.profile.p1} & ${state.profile.p2}`;
  $('#countNote').textContent = t('dash.countNote', d, `${state.profile.p1} & ${state.profile.p2}`);
  const total = Math.max(1, Math.ceil((new Date(state.profile.date) - new Date('2026-09-01')) / 86400000));
  $('#countBar').style.width = Math.min(100, Math.max(4, 100 - d / total * 100)) + '%';
  $('#donutPct').textContent = budgetPct() + '%';
  const g = state.goals[0]; if (g) { g.current = confirmedBookings(); }
}

function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

function smoothPath(pts) {
  if (pts.length < 3) return 'M' + pts.map(p => p.join(',')).join(' L');
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

let areaPts = [];
function renderArea() {
  const svg = $('#areaChart');
  const data = state.spend[state.range];
  const W = 560, H = 230, P = { t: 30, r: 16, b: 30, l: 46 };
  const max = Math.ceil(Math.max(...data.values) * 1.15);
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  areaPts = data.values.map((v, i) => [P.l + (data.values.length === 1 ? iw / 2 : i * iw / (data.values.length - 1)), P.t + (1 - v / max) * ih]);
  const line = smoothPath(areaPts);
  const area = line + `L${areaPts[areaPts.length - 1][0]},${H - P.b} L${areaPts[0][0]},${H - P.b} Z`;
  const faint = cssVar('--ink-faint') || '#8d84ad';
  const grid = [0.25, 0.5, 0.75, 1].map(f => { const y = P.t + (1 - f) * ih; return `<line x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}" stroke="${faint}" stroke-opacity=".18" stroke-dasharray="3 5"/><text x="${P.l - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="${faint}" font-weight="600">${(max * f).toFixed(0)}M</text>`; }).join('');
  const labels = data.labels.map((l, i) => `<text x="${areaPts[i][0]}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="${faint}" font-weight="700">${l}</text>`).join('');
  const peak = areaPts[data.values.indexOf(Math.max(...data.values))];
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `
    <defs>
      <linearGradient id="areaFill" x1="0" y1="0" x2="1" y2=".7"><stop offset="0" stop-color="#56ccf2" stop-opacity=".7"/><stop offset=".45" stop-color="#7c6cf8" stop-opacity=".55"/><stop offset="1" stop-color="#ff6fb5" stop-opacity=".5"/></linearGradient>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c6cf8"/><stop offset=".55" stop-color="#c86dd7"/><stop offset="1" stop-color="#4fb3ff"/></linearGradient>
      <filter id="lineGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    ${grid}
    <path d="${area}" fill="url(#areaFill)"/>
    <path d="${line}" fill="none" stroke="url(#lineGrad)" stroke-width="3.2" stroke-linecap="round" filter="url(#lineGlow)"/>
    ${areaPts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4.2" fill="#fff" stroke="#8b7cf6" stroke-width="2.4"/>`).join('')}
    <g id="areaHover" style="opacity:0"><line id="ahLine" y1="${P.t}" y2="${H - P.b}" stroke="#8b7cf6" stroke-opacity=".4" stroke-dasharray="3 4"/><circle id="ahDot" r="6" fill="#fff" stroke="#c86dd7" stroke-width="3"/></g>
    <g transform="translate(${Math.min(Math.max(peak[0], 70), W - 70)},${Math.max(peak[1] - 16, 18)})"><rect x="-46" y="-15" width="92" height="24" rx="8" fill="rgba(30,20,58,.92)"/><text y="1" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${fmtM(Math.max(...data.values) * 1e6)}</text><path d="M-4 9l4 5 4-5z" fill="rgba(30,20,58,.92)"/></g>
    ${labels}`;
  svg.onmousemove = e => {
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * W;
    let best = 0, bd = 1e9;
    areaPts.forEach((p, i) => { const d = Math.abs(p[0] - x); if (d < bd) { bd = d; best = i; } });
    const p = areaPts[best];
    const hover = $('#areaHover'); hover.style.opacity = 1;
    $('#ahLine').setAttribute('x1', p[0]); $('#ahLine').setAttribute('x2', p[0]);
    $('#ahDot').setAttribute('cx', p[0]); $('#ahDot').setAttribute('cy', p[1]);
    const tip = $('#areaTip');
    tip.classList.remove('hidden');
    tip.textContent = `${data.labels[best]} · ${fmtM(data.values[best] * 1e6)}`;
    tip.style.left = (p[0] / W * rect.width) + 'px';
    tip.style.top = (p[1] / H * rect.height) + 'px';
  };
  svg.onmouseleave = () => { $('#areaHover').style.opacity = 0; $('#areaTip').classList.add('hidden'); };
}

const DONUT = [
  { k: 'budget.venue', pct: 35, color: '#8b7cf6' },
  { k: 'budget.catering', pct: 28, color: '#4fb3ff' },
  { k: 'budget.decor', pct: 14, color: '#ff6fb5' },
  { k: 'budget.photo', pct: 12, color: '#ffb84d' },
  { k: 'budget.music', pct: 7, color: '#2fd4a7' },
  { k: 'budget.attire', pct: 4, color: '#ff8a7a' },
];
function renderDonut() {
  const svg = $('#donutChart'); const r = 62, c = 2 * Math.PI * r;
  let acc = 0;
  svg.setAttribute('viewBox', '0 0 150 150');
  svg.innerHTML = `<circle cx="75" cy="75" r="${r}" fill="none" stroke="rgba(124,108,248,.1)" stroke-width="23"/>` +
    DONUT.map(s => { const len = s.pct / 100 * c; const off = -acc; acc += len; return `<circle cx="75" cy="75" r="${r}" fill="none" stroke="${s.color}" stroke-width="23" stroke-dasharray="0 ${c}" data-len="${len}" data-off="${off}" stroke-dashoffset="${off}" stroke-linecap="butt"/>`; }).join('');
  const finishDonut = () => $$('#donutChart circle[data-len]').forEach(el => el.setAttribute('stroke-dasharray', `${el.dataset.len} ${c - el.dataset.len}`));
  if (reducedMotion) finishDonut(); else requestAnimationFrame(() => requestAnimationFrame(finishDonut));
  $('#donutLegend').innerHTML = DONUT.map(s => `<li><i class="dot" style="background:${s.color};color:${s.color}"></i>${t(s.k)}<strong>${s.pct}% · ${fmtM(state.profile.budget * s.pct / 100)}</strong></li>`).join('');
}

function renderBars() {
  const svg = $('#barChart');
  const vals = state.week === 'this' ? state.weekThis : state.weekLast;
  const W = 340, H = 190, P = { t: 22, b: 28, l: 6, r: 6 };
  const max = Math.max(...vals, 7);
  const bw = 26, gap = (W - P.l - P.r - bw * 7) / 6;
  const hues = [['#8b7cf6', '#c86dd7'], ['#56ccf2', '#5b8cff'], ['#ff8fb8', '#ff6fb5'], ['#ffc24b', '#ff9a3d'], ['#3ddc97', '#22c99b'], ['#ff9a8a', '#ff7e6b'], ['#7c9aff', '#5b8cff']];
  const faint = cssVar('--ink-faint') || '#8d84ad';
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `<defs>${hues.map((h, i) => `<linearGradient id="barG${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h[0]}"/><stop offset="1" stop-color="${h[1]}"/></linearGradient>`).join('')}</defs>` +
    vals.map((v, i) => {
      const h = v / max * (H - P.t - P.b), x = P.l + i * (bw + gap), y = H - P.b - h;
      return `<rect class="bar" x="${x}" y="${H - P.b}" width="${bw}" height="0" rx="7" fill="url(#barG${i})" data-y="${y}" data-h="${h}"><title>${t('days')[i]}: ${v}</title></rect>
      <text x="${x + bw / 2}" y="${y - 7}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${faint}" class="bar-val" style="opacity:0" data-y="${y - 7}">${v}</text>
      <text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="10" font-weight="700" fill="${faint}">${t('days')[i]}</text>`;
    }).join('');
  const finishBars = () => {
    $$('#barChart rect.bar').forEach(el => { el.setAttribute('y', el.dataset.y); el.setAttribute('height', el.dataset.h); });
    $$('#barChart .bar-val').forEach(el => { el.style.transition = 'opacity .5s .4s'; el.style.opacity = 1; el.setAttribute('y', el.dataset.y); });
  };
  if (reducedMotion) finishBars(); else requestAnimationFrame(() => requestAnimationFrame(finishBars));
}

function renderTasks() {
  const done = state.tasks.filter(x => x.done).length;
  $('#clProgress').textContent = `${done}/${state.tasks.length}`;
  $('#clBar').style.width = (state.tasks.length ? done / state.tasks.length * 100 : 0) + '%';
  $('#taskList').innerHTML = state.tasks.map(x => `
    <li class="${x.done ? 'done' : ''}" data-id="${x.id}">
      <button type="button" class="task-check" data-action="toggle-task" data-id="${x.id}" aria-label="Toggle task">${icon('check')}</button>
      <span class="task-label">${esc(x.label)}</span>
      <button type="button" class="task-del" data-action="del-task" data-id="${x.id}" aria-label="Delete task">${icon('trash')}</button>
    </li>`).join('');
  $('#goalList').innerHTML = state.goals.map(g => `
    <div class="goal" data-id="${g.id}">
      <div class="goal-top"><span>${esc(g.label)}</span><span>${Math.min(g.current, g.target)}/${g.target} <button type="button" data-action="goal-inc" data-id="${g.id}" style="color:var(--violet);font-weight:800" aria-label="Log progress">+</button></span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, g.current / g.target * 100)}%"></div></div>
    </div>`).join('');
}

function renderAvatars() {
  const people = [state.profile.p1, ...state.collaborators];
  const cols = [['#8b7cf6', '#c86dd7'], ['#56ccf2', '#5b8cff'], ['#ff8fb8', '#ff6fb5'], ['#ffc24b', '#ff9a3d']];
  $('#avatarStack').innerHTML = people.slice(0, 4).map((p, i) => `<span class="ava" style="background:linear-gradient(135deg,${cols[i % 4][0]},${cols[i % 4][1]})" title="${esc(p)}">${esc(p.trim()[0] || '?').toUpperCase()}</span>`).join('');
}

function renderDashboard() { renderStats(); renderArea(); renderDonut(); renderBars(); renderTasks(); renderAvatars(); }

/* ---------------- bookings ---------------- */
function renderBookings() {
  const list = [...state.bookings].sort((a, b) => b.ts - a.ts);
  $('#bookingEmpty').classList.toggle('hidden', list.length > 0);
  $('#bookingList').innerHTML = list.map(b => {
    const v = state.vendors.find(x => x.id === b.vendorId);
    if (!v) return '';
    const st = b.status === 'confirmed' ? 'st-confirmed' : b.status === 'pending' ? 'st-pending' : 'st-cancelled';
    return `<div class="booking-card glass ${b.status === 'cancelled' ? 'cancelled' : ''}" data-id="${b.id}">
      <img src="${v.img}" alt="${esc(v.name)}">
      <div class="bk-info">
        <strong>${esc(v.name)}</strong>
        <div class="bk-meta">
          <span>${icon('calendar')}${fmtDate(b.date)}</span>
          <span>${icon('users')}${b.guests} ${state.lang === 'sw' ? 'wageni' : 'guests'}</span>
          <span>${icon('wallet')}${esc(b.provider)}</span>
          <span>${esc(v.packages[b.pkg]?.name || '')}</span>
        </div>
      </div>
      <div class="bk-amount"><strong>${fmtM(b.deposit)}</strong><small>${t('bookings.deposit')} · ${fmtM(b.total)} ${state.lang === 'sw' ? 'jumla' : 'total'}</small></div>
      <span class="status-chip ${st}">${t('bookings.' + b.status)}</span>
      <div class="bk-actions">
        <button type="button" class="btn btn-glass" data-action="view" data-id="${v.id}">${t('bookings.view')}</button>
        ${b.status !== 'cancelled' ? `<button type="button" class="btn btn-danger" data-action="cancel-booking" data-id="${b.id}">${t('bookings.cancel')}</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ---------------- profile / vision ---------------- */
function renderProfile() {
  $('#p1').value = state.profile.p1; $('#p2').value = state.profile.p2;
  $('#pDate').value = state.profile.date; $('#pBudget').value = state.profile.budget;
  if ($('#pDate')._gdSync) $('#pDate')._gdSync();
  $('#pGuests').value = state.profile.guests; $('#pConfirmed').value = state.profile.confirmed;
  renderVision();
}
function renderVision() {
  const p = state.profile;
  $('#visionNames').textContent = `${p.p1} & ${p.p2}`;
  $('#visionRows').innerHTML = `
    <div class="vision-row">${icon('calendar')}<span>${t('profile.date')}</span><strong>${fmtDate(p.date)}</strong></div>
    <div class="vision-row">${icon('pin')}<span>${t('profile.region')}</span><strong>${regT(p.region)}</strong></div>
    <div class="vision-row">${icon('users')}<span>${t('profile.guests')}</span><strong>${p.confirmed} / ${p.guests}</strong></div>
    <div class="vision-row">${icon('wallet')}<span>${t('profile.budget')}</span><strong>${fmtTZS(p.budget)}</strong></div>
    <div class="vision-row">${icon('sparkles')}<span>${t('profile.theme')}</span><strong>${t('theme.' + p.theme)}</strong></div>`;
  $('#visionNote').textContent = t('profile.vision', `${p.p1} & ${p.p2}`, t('theme.' + p.theme), regT(p.region), fmtDate(p.date));
}

/* ---------------- notifications / auth ---------------- */
function renderNotifs() {
  const unread = state.notifications.filter(n => n.unread).length;
  $('#bellBadge').textContent = unread;
  $('#bellBadge').style.display = unread ? 'grid' : 'none';
  $('#notifList').innerHTML = state.notifications.map(n => `
    <li class="${n.unread ? 'unread' : ''}">${icon(n.icon)}<div>${esc(state.lang === 'sw' ? n.sw : n.en)}<time>${esc(state.lang === 'sw' ? n.tsw : n.ten)}</time></div></li>`).join('');
}
function pushNotif(en, sw, ic = 'check') {
  state.notifications.unshift({ id: uid(), icon: ic, en, sw, ten: 'just now', tsw: 'sasa hivi', unread: true });
  renderNotifs(); save();
}
function renderAuth() {
  const btn = $('#loginBtn');
  if (state.user) btn.innerHTML = `<span class="ava" style="width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:800;background:rgba(255,255,255,.25)">${esc(state.user.name[0].toUpperCase())}</span><span>${esc(state.user.name.split(' ')[0])}</span>`;
  else btn.innerHTML = `${icon('user')}<span>${t('nav.login')}</span>`;
}

/* ---------------- toasts ---------------- */
function toast(msg, type = 'success', undoFn = null) {
  const el = document.createElement('div');
  el.className = 'toast glass';
  el.innerHTML = `<span class="t-ic t-${type}">${icon(type === 'success' ? 'check' : type === 'warn' ? 'bell' : 'sparkles')}</span><span>${esc(msg)}</span>${undoFn ? `<button type="button" class="undo-btn">${t('bookings.undo')}</button>` : ''}`;
  $('#toastRoot').appendChild(el);
  const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 360); };
  const timer = setTimeout(kill, undoFn ? 6000 : 3800);
  if (undoFn) el.querySelector('.undo-btn').onclick = () => { clearTimeout(timer); undoFn(); kill(); };
  el.addEventListener('click', e => { if (!e.target.closest('.undo-btn')) { clearTimeout(timer); kill(); } });
}

/* ---------------- drawer ---------------- */
let drawerVendor = null, drawerPkg = 0;
function openDrawer(id) {
  const v = state.vendors.find(x => x.id === id); if (!v) return;
  drawerVendor = v; drawerPkg = 0;
  const d = $('#vendorDrawer');
  d.innerHTML = `
    <div class="drawer-photo">
      <img src="${v.img}" alt="${esc(v.name)}">
      <button type="button" class="icon-btn drawer-close" data-action="close-drawer" aria-label="Close">${icon('x')}</button>
    </div>
    <div class="drawer-body">
      <div>
        <h3>${esc(v.name)}</h3>
        <div class="drawer-sub" style="margin-top:8px">
          <span class="vc-region">${icon('pin')}${esc(regT(v.region))}</span>
          <span class="vc-rating">${stars(v.rating)}<strong>${v.rating ? v.rating.toFixed(1) : '—'}</strong><span>${t('vendor.reviews', v.reviews)}</span></span>
          ${v.verified ? `<span class="vc-verified" style="position:static">${icon('shield')}${t('vendor.verified')}</span>` : ''}
        </div>
      </div>
      <p class="drawer-desc">${esc(v.desc)}</p>
      <div><h5>${t('modal.package')}</h5><div class="pkg-list">
        ${v.packages.map((p, i) => `<button type="button" class="pkg ${i === 0 ? 'selected' : ''}" data-action="pkg" data-i="${i}"><span class="pkg-radio"></span><span><strong>${esc(p.name)}</strong><small>${esc(p.desc)}</small></span><span class="pkg-price">${fmtM(p.price)}${v.perHead ? ' /100' : ''}</span></button>`).join('')}
      </div></div>
      <div><h5>${state.lang === 'sw' ? 'Huduma' : 'What\'s included'}</h5><div class="amenities">${(v.amenities || []).map(a => `<span class="amenity">${esc(a)}</span>`).join('')}</div></div>
      <div><h5>${state.lang === 'sw' ? 'Maoni ya wanandoa' : 'Couple reviews'}</h5>
        <div class="review"><strong>Neema & Joseph ${stars(5)}</strong>${state.lang === 'sw' ? 'Walifanya siku yetu kuwa ya ndoto. Wataalamu, wakarimu, na kila kitu kwa wakati.' : 'They made our day feel effortless. Professional, warm, and everything ran on time — guests still talk about it.'}</div>
      </div>
      <div><h5>Mobile money</h5><div class="amenities">${v.mm.map(m => `<span class="amenity"><i class="mm-dot mm-${m === 'M-Pesa' ? 'mpesa' : m === 'Tigo Pesa' ? 'tigo' : m === 'Airtel Money' ? 'airtel' : 'halo'}" style="display:inline-block;margin-right:6px"></i>${m}</span>`).join('')}</div></div>
    </div>
    <div class="drawer-foot">
      <div class="df-price"><small>${t('vendor.from')}</small><strong id="dfPrice">${fmtM(v.packages[0].price)}</strong></div>
      <button type="button" class="btn btn-primary" data-action="book" data-id="${v.id}" ${v.pending ? 'disabled' : ''}>${t('vendor.book')} ${icon('arrow')}</button>
    </div>`;
  $('#drawerOverlay').classList.remove('hidden');
  d.classList.remove('hidden');
  requestAnimationFrame(() => d.classList.add('open'));
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  const d = $('#vendorDrawer');
  d.classList.remove('open');
  $('#drawerOverlay').classList.add('hidden');
  setTimeout(() => d.classList.add('hidden'), 480);
  document.body.style.overflow = '';
}

/* ---------------- modals ---------------- */
function openModal(html) {
  closePop();
  $('#modalRoot').innerHTML = `<div class="modal glass-thick" role="dialog" aria-modal="true">${html}</div>`;
  $('#modalRoot').classList.add('open');
  $('#modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  enhancePickers($('#modalRoot'));
  const f = $('#modalRoot input:not(.gd-native), #modalRoot .gs-trigger'); if (f) setTimeout(() => f.focus(), 80);
}
function closeModal() {
  closePop();
  $('#modalRoot').classList.remove('open');
  $('#modalRoot').innerHTML = '';
  $('#modalOverlay').classList.add('hidden');
  $$('body > .gs-panel, body > .gd-panel').forEach(p => { if (!p._owner.isConnected) p.remove(); });
  if (!$('#vendorDrawer').classList.contains('open')) document.body.style.overflow = '';
}
const modalClose = `<button type="button" class="icon-btn modal-close" data-action="close-modal" aria-label="Close">${icon('x')}</button>`;

/* ---------------- auth ---------------- */
let authView = 'login', resendAt = 0, resendTimer = null;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
async function hashPass(p, stored) {
  const salt = stored ? Uint8Array.from(stored.split(':')[0].match(/../g), x => parseInt(x, 16)) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(p), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' }, key, 256);
  const hex = bytes => [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${hex(salt)}:${hex(new Uint8Array(bits))}`;
}
const findAccount = email => state.accounts.find(a => a.email === email.toLowerCase());
const setErr = (id, msg) => { const f = $('#' + id).closest('.field'); f.classList.add('invalid'); f.querySelector('.field-err').textContent = msg; };
const clearErrs = root => $$('.field.invalid', root).forEach(f => f.classList.remove('invalid'));
const textField = (id, label, type, ph, ac) => `
  <div class="field"><label for="${id}">${label}</label><input type="${type}" id="${id}" placeholder="${ph}" ${ac ? `autocomplete="${ac}"` : ''}><small class="field-err"></small></div>`;
const passField = (id, label, ac) => `
  <div class="field"><label for="${id}">${label}</label>
    <div class="pw-wrap"><input type="password" id="${id}" placeholder="••••••••" autocomplete="${ac}">
      <button type="button" class="pw-eye" data-eye="${id}" aria-label="${t('auth.showPass')}">${icon('eye')}</button></div>
    <small class="field-err"></small></div>`;
const newCode = () => String(Math.floor(100000 + Math.random() * 900000));

function openAuth(view = 'login') {
  clearInterval(resendTimer);
  if (state.user) view = 'account';
  if (view === 'signup' && !state.signupRole) view = 'roles';
  authView = view;
  const head = (title, sub) => `<span class="auth-lockup" aria-hidden="true"><span class="lockup-mask"></span></span><div class="auth-head"><div><h3>${title}</h3><p class="modal-sub">${sub}</p></div></div>`;
  const tabs = `
    <div class="auth-tabs">
      <button type="button" data-auth-view="login" class="${view === 'login' ? 'active' : ''}">${t('auth.loginTab')}</button>
      <button type="button" data-auth-view="signup" class="${view === 'signup' ? 'active' : ''}">${t('auth.signupTab')}</button>
    </div>`;
  const back = `<button type="button" class="auth-link auth-back" data-auth-view="login">${icon('chev', 'ic auth-back-ic')}${t('auth.backLogin')}</button>`;
  let html = '';
  if (view === 'account') {
    const acct = findAccount(state.user.email);
    html = `${modalClose}<div class="auth-swap" data-auth>
      ${head(t('modal.account'), `${t('modal.loggedIn')} <strong>${esc(state.user.name)}</strong> (${esc(state.user.email)})${acct ? `<br><small class="auth-since">${t('auth.memberSince', fmtDate(acct.created))}</small>` : ''}`)}
      <div style="display:flex;gap:10px"><a href="#profile" class="btn btn-glass" data-action="close-modal" style="flex:1">${t('nav.profile')}</a>
      <button type="button" class="btn btn-danger" data-action="logout" style="flex:1">${icon('logout')}${t('modal.logout')}</button></div></div>`;
  } else if (view === 'roles') {
    html = `${modalClose}<div class="auth-swap" data-auth>${head(t('role.title'), t('role.sub'))}
      <div class="role-cards">
        <button type="button" class="role-card" data-role-pick="customer"><span class="rc-ic">${icon('heart')}</span><strong>${t('role.customerT')}</strong><small>${t('role.customerS')}</small><span class="rc-tag">${t('role.customerTag')}</span></button>
        <button type="button" class="role-card" data-role-pick="vendor"><span class="rc-ic">${icon('grid')}</span><strong>${t('role.vendorT')}</strong><small>${t('role.vendorS')}</small><span class="rc-tag">${t('role.vendorTag')}</span></button>
      </div>
      <p class="role-admin-note">${icon('shield')}<span>${t('role.adminNote')}</span></p></div>`;
  } else if (view === 'login') {
    const demo = state.accounts.filter(a => a.internal || ['customer', 'vendor', 'admin'].includes(a.role)).slice(0, 3);
    html = `${modalClose}<div class="auth-swap" data-auth>${head(t('auth.loginTitle'), t('auth.loginSub'))}${tabs}
      <form id="authForm" novalidate>
        ${textField('auEmail', t('auth.email'), 'email', 'amina@example.com', 'email')}
        ${passField('auPass', t('auth.password'), 'current-password')}
        <div class="auth-row"><button type="button" class="auth-link" data-auth-view="forgot">${t('auth.forgot')}</button></div>
        <button type="submit" class="btn btn-primary btn-lg btn-block">${t('auth.loginBtn')}${icon('arrow')}</button>
      </form>
      ${demo.length ? `<div class="demo-accounts"><small>${t('role.demo')} — ${t('role.demoHint')}</small><div class="demo-chips">${demo.map(a => `<button type="button" class="demo-chip" data-demo="${esc(a.email)}" title="demo1234">${icon(a.role === 'admin' ? 'shield' : a.role === 'vendor' ? 'grid' : 'heart')}${esc(a.email.split('@')[0])}</button>`).join('')}</div></div>` : ''}
      <p class="auth-switch">${t('auth.noAccount')} <button type="button" data-auth-view="signup">${t('auth.signupTab')}</button></p></div>`;
  } else if (view === 'signup') {
    const roleTag = state.signupRole === 'vendor' ? t('role.vendorTag') : t('role.customerTag');
    html = `${modalClose}<div class="auth-swap" data-auth>${head(t('auth.signupTitle'), t('auth.signupSub'))}${tabs}
      <div class="role-chosen">${icon('check')}<span>${t('role.chosen', roleTag)}</span><button type="button" class="auth-link" data-auth-view="roles">${t('role.change')}</button></div>
      <form id="authForm" novalidate>
        ${textField('auName', t('auth.name'), 'text', 'Amina Hassan', 'name')}
        ${textField('auEmail', t('auth.email'), 'email', 'amina@example.com', 'email')}
        ${passField('auPass', t('auth.password'), 'new-password')}
        ${passField('auConfirm', t('auth.confirm'), 'new-password')}
        <button type="submit" class="btn btn-primary btn-lg btn-block">${t('auth.signupBtn')}${icon('arrow')}</button>
      </form>
      <p class="auth-switch">${t('auth.haveAccount')} <button type="button" data-auth-view="login">${t('auth.loginTab')}</button></p></div>`;
  } else if (view === 'forgot') {
    html = `${modalClose}<div class="auth-swap" data-auth>${back}${head(t('auth.forgotTitle'), t('auth.forgotSub'))}
      <form id="authForm" novalidate>
        ${textField('auEmail', t('auth.email'), 'email', 'amina@example.com', 'email')}
        <button type="submit" class="btn btn-primary btn-lg btn-block">${icon('send')}${t('auth.sendCode')}</button>
      </form></div>`;
  } else if (view === 'code') {
    html = `${modalClose}<div class="auth-swap" data-auth>${back}${head(t('auth.codeTitle'), t('auth.codeSub', esc(state.reset.email)))}
      <div class="demo-mail">${icon('mail')}<div><strong>${t('auth.demoInbox')}</strong><small>${t('auth.demoNote')}</small><span class="demo-code">${state.reset.code}</span></div></div>
      <form id="authForm" novalidate>
        ${textField('auCode', t('auth.code'), 'text', '123456')}
        ${passField('auPass', t('auth.newPass'), 'new-password')}
        ${passField('auConfirm', t('auth.confirm'), 'new-password')}
        <button type="submit" class="btn btn-primary btn-lg btn-block">${icon('lock')}${t('auth.resetBtn')}</button>
      </form>
      <p class="auth-switch"><button type="button" class="auth-link" id="resendBtn">${t('auth.resend')}</button></p></div>`;
  } else if (view === 'done') {
    html = `${modalClose}<div class="auth-swap" data-auth>
      <div class="pay-success"><span class="success-ring">${icon('check')}</span>
        <h3>${t('auth.resetDone')}</h3><p class="modal-sub" style="margin:0">${t('auth.resetDoneSub')}</p>
        <button type="button" class="btn btn-primary btn-block" data-auth-view="login">${t('auth.backLogin')}</button></div></div>`;
  }
  openModal(html);
  const root = $('#modalRoot');
  if (view === 'code') $('#auCode').setAttribute('inputmode', 'numeric');
  $$('[data-auth-view]', root).forEach(b => b.onclick = () => openAuth(b.dataset.authView));
  $$('[data-role-pick]', root).forEach(b => b.onclick = () => { state.signupRole = b.dataset.rolePick; openAuth('signup'); });
  $$('[data-demo]', root).forEach(b => b.onclick = () => { $('#auEmail').value = b.dataset.demo; $('#auPass').value = 'demo1234'; $('#auPass').focus(); });
  $$('.pw-eye', root).forEach(b => b.onclick = () => {
    const i = $('#' + b.dataset.eye); const show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    b.innerHTML = icon(show ? 'eye-off' : 'eye');
    b.setAttribute('aria-label', t(show ? 'auth.hidePass' : 'auth.showPass'));
    i.focus();
  });
  const form = $('#authForm', root);
  if (form) form.onsubmit = async e => {
    e.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    if (submit.disabled) return;
    submit.disabled = true;
    clearErrs(root);
    try {
    const email = ($('#auEmail')?.value || '').trim().toLowerCase();
    if (view === 'login') {
      if (!EMAIL_RE.test(email)) return setErr('auEmail', t('auth.errEmail'));
      const acct = findAccount(email);
      if (!acct) return setErr('auEmail', t('auth.errNoUser'));
      if (await hashPass($('#auPass').value, acct.hash) !== acct.hash) return setErr('auPass', t('auth.errWrongPass'));
      state.user = { name: acct.name, email: acct.email, role: acct.role || 'customer' };
      save(); renderAuth(); renderStats(); applyRole(); renderRoleSections(); closeModal();
      toast(t('auth.welcome', acct.name.split(' ')[0]), 'success');
    } else if (view === 'signup') {
      const name = $('#auName').value.trim();
      if (name.length < 2) return setErr('auName', t('auth.errName'));
      if (!EMAIL_RE.test(email)) return setErr('auEmail', t('auth.errEmail'));
      if (findAccount(email)) return setErr('auEmail', t('auth.errExists'));
      const p = $('#auPass').value, c = $('#auConfirm').value;
      if (p.length < 8) return setErr('auPass', t('auth.errPass'));
      if (p !== c) return setErr('auConfirm', t('auth.errMatch'));
      const role = state.signupRole === 'vendor' ? 'vendor' : 'customer';
      state.accounts.push({ id: uid(), name, email, role, hash: await hashPass(p), created: isoDate(new Date()) });
      state.user = { name, email, role };
      state.signupRole = null;
      save(); renderAuth(); renderStats(); applyRole(); renderRoleSections(); closeModal();
      toast(t('auth.created', name.split(' ')[0]), 'success');
      pushNotif(I18N.en['auth.welcomeNotif'](name), I18N.sw['auth.welcomeNotif'](name), 'heart');
    } else if (view === 'forgot') {
      if (!EMAIL_RE.test(email)) return setErr('auEmail', t('auth.errEmail'));
      if (!findAccount(email)) return setErr('auEmail', t('auth.errNoUser'));
      state.reset = { email, code: newCode(), exp: Date.now() + 600000 };
      openAuth('code');
    } else if (view === 'code') {
      const code = $('#auCode').value.trim();
      if (!/^\d{6}$/.test(code)) return setErr('auCode', t('auth.errCodeFmt'));
      if (!state.reset || code !== state.reset.code || Date.now() > state.reset.exp) return setErr('auCode', t('auth.errCode'));
      const p = $('#auPass').value, c = $('#auConfirm').value;
      if (p.length < 8) return setErr('auPass', t('auth.errPass'));
      if (p !== c) return setErr('auConfirm', t('auth.errMatch'));
      findAccount(state.reset.email).hash = await hashPass(p);
      state.reset = null; save();
      pushNotif(I18N.en['auth.resetNotif'], I18N.sw['auth.resetNotif'], 'lock');
      openAuth('done');
    }
    } catch {
      toast(t('auth.errUnavailable'), 'warn');
    } finally {
      submit.disabled = false;
    }
  };
  const rb = $('#resendBtn', root);
  if (rb) {
    const tick = () => {
      const left = Math.ceil((resendAt - Date.now()) / 1000);
      if (left > 0) { rb.disabled = true; rb.textContent = `${t('auth.resend')} (${left}s)`; }
      else { rb.disabled = false; rb.textContent = t('auth.resend'); clearInterval(resendTimer); }
    };
    tick(); resendTimer = setInterval(tick, 1000);
    rb.onclick = () => {
      if (Date.now() < resendAt || !state.reset) return;
      state.reset.code = newCode(); state.reset.exp = Date.now() + 600000;
      resendAt = Date.now() + 30000;
      openAuth('code'); toast(t('auth.resent'), 'success');
    };
  }
}

function bookingTotal(v, pkgIdx, guests) { const p = v.packages[pkgIdx]; return v.perHead ? p.price * Math.max(1, Math.ceil(guests / 100)) : p.price; }

function openBooking(id, pkgIdx = 0) {
  const v = state.vendors.find(x => x.id === id); if (!v || v.pending) return;
  let pkg = pkgIdx, guests = state.profile.guests, provider = v.mm[0] || 'M-Pesa';
  const total = () => bookingTotal(v, pkg, guests);
  openModal(`${modalClose}<h3>${t('modal.bookTitle')} · ${esc(v.name)}</h3><p class="modal-sub">${t('modal.bookSub')}</p>
    <form id="bookForm">
      <div class="field"><label>${t('modal.package')}</label><div class="select-wrap"><select id="bkPkg">${v.packages.map((p, i) => `<option value="${i}" ${i === pkg ? 'selected' : ''}>${esc(p.name)} — ${fmtM(p.price)}${v.perHead ? ' /100' : ''}</option>`).join('')}</select>${icon('chev')}</div></div>
      <div class="form-row">
        <div class="field"><label>${t('modal.date')}</label><input type="date" id="bkDate" value="${filters.date || state.profile.date}" required></div>
        <div class="field"><label>${t('modal.guests')}</label><div class="stepper"><button type="button" data-step="-10">−</button><input type="number" id="bkGuests" value="${guests}" min="10" max="2000" step="10"><button type="button" data-step="10">+</button></div></div>
      </div>
      <div class="field"><label>${t('modal.provider')}</label><div class="mm-select" id="bkMM">
        ${MM_PROVIDERS.map(m => `<button type="button" class="mm-opt ${m === provider ? 'selected' : ''} ${v.mm.includes(m) ? '' : 'hidden'}" data-mm="${m}"><i class="mm-dot mm-${m === 'M-Pesa' ? 'mpesa' : m === 'Tigo Pesa' ? 'tigo' : m === 'Airtel Money' ? 'airtel' : 'halo'}"></i>${m}</button>`).join('')}
      </div></div>
      <div class="field"><label>${t('modal.phone')}</label><input type="tel" id="bkPhone" placeholder="0712 345 678" required></div>
      <div class="pay-summary" id="bkSummary"></div>
      <button type="submit" class="btn btn-primary btn-lg btn-block" id="bkPay">${icon('wallet')}<span>${t('modal.pay')}</span></button>
    </form>`);
  const summary = () => {
    const tt = total(), dep = Math.round(tt * .3);
    $('#bkSummary').innerHTML = `<div class="row"><span>${t('modal.total')}</span><strong>${fmtTZS(tt)}</strong></div>
      <div class="row deposit"><span>${t('modal.deposit')}</span><strong>${fmtTZS(dep)}</strong></div>
      <div class="row"><span>${t('modal.balance')}</span><span>${fmtTZS(tt - dep)}</span></div>`;
  };
  summary();
  $('#bkPkg').onchange = e => { pkg = +e.target.value; summary(); };
  $('#bkGuests').oninput = e => { guests = Math.max(10, +e.target.value || 10); summary(); };
  $$('#modalRoot .stepper button').forEach(b => b.onclick = () => { const inp = $('#bkGuests'); inp.value = Math.max(10, Math.min(2000, (+inp.value || 0) + (+b.dataset.step))); guests = +inp.value; summary(); });
  $$('#bkMM .mm-opt').forEach(b => b.onclick = () => { provider = b.dataset.mm; $$('#bkMM .mm-opt').forEach(x => x.classList.toggle('selected', x === b)); });
  $('#bookForm').onsubmit = e => {
    e.preventDefault();
    const phone = $('#bkPhone').value.replace(/\s/g, '');
    if (!/^(\+?255|0)\d{9}$/.test(phone)) { toast(t('modal.badPhone'), 'warn'); $('#bkPhone').focus(); return; }
    const btn = $('#bkPay');
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span><span>${t('modal.processing')}</span>`;
    setTimeout(() => {
      const tt = total(), dep = Math.round(tt * .3);
      const b = { id: uid(), vendorId: v.id, pkg, date: $('#bkDate').value, guests, provider, phone: $('#bkPhone').value, total: tt, deposit: dep, status: 'confirmed', ts: Date.now() };
      state.bookings.push(b);
      state.profile.budgetUsed += dep;
      save(); renderBookings(); renderDashboard();
      pushNotif(`${v.name} confirmed your booking — deposit ${fmtM(dep)} via ${provider}.`, `${v.name} imethibitisha uhifadhi — amana ${fmtM(dep)} kwa ${provider}.`, 'heart');
      $('#modalRoot .modal').innerHTML = `${modalClose}
        <div class="pay-success">
          <span class="success-ring">${icon('check')}</span>
          <h3>${t('modal.successTitle')}</h3>
          <p class="modal-sub" style="margin:0">${t('modal.successSub')}</p>
          <div class="pay-summary" style="width:100%"><div class="row"><span>${esc(v.name)}</span><strong>${fmtTZS(dep)}</strong></div><div class="row"><span>${provider} · ${esc($('#bkPhone')?.value || phone)}</span><span>${fmtDate(b.date)}</span></div></div>
          <div style="display:flex;gap:10px;width:100%"><button type="button" class="btn btn-glass" data-action="close-modal" style="flex:1">${t('modal.done')}</button>
          <button type="button" class="btn btn-primary" data-action="goto-bookings" style="flex:1">${t('modal.viewBookings')}</button></div>
        </div>`;
    }, 1400);
  };
}

function openTaskModal() {
  openModal(`${modalClose}<h3>${t('modal.taskTitle')}</h3><p class="modal-sub">${t('modal.taskSub')}</p>
    <form id="taskModalForm"><div class="field"><label>${t('modal.taskLabel')}</label><input type="text" id="tmLabel" required maxlength="80" placeholder="${state.lang === 'sw' ? 'mf. Lipa amana ya ukumbi' : 'e.g. Pay venue deposit'}"></div>
    <button type="submit" class="btn btn-primary btn-block">${icon('plus')}${t('modal.add')}</button></form>`);
  $('#taskModalForm').onsubmit = e => { e.preventDefault(); addTask($('#tmLabel').value.trim()); closeModal(); };
}
function openInvite() {
  openModal(`${modalClose}<h3>${t('modal.inviteTitle')}</h3><p class="modal-sub">${t('modal.inviteSub')}</p>
    <form id="inviteForm"><div class="field"><label>${t('modal.name')}</label><input type="text" id="invName" required maxlength="40" placeholder="Zawadi"></div>
    <div class="field"><label>${t('modal.email')}</label><input type="email" id="invEmail" required placeholder="zawadi@example.com"></div>
    <button type="submit" class="btn btn-primary btn-block">${icon('users')}${t('modal.inviteBtn')}</button></form>`);
  $('#inviteForm').onsubmit = e => {
    e.preventDefault();
    const n = $('#invName').value.trim();
    state.collaborators.push(n); save(); renderAvatars(); closeModal();
    toast(t('modal.invited', n), 'success');
  };
}
function openGoal() {
  openModal(`${modalClose}<h3>${t('modal.goalTitle')}</h3><p class="modal-sub">${t('modal.goalSub')}</p>
    <form id="goalForm"><div class="field"><label>${t('modal.goalLabel')}</label><input type="text" id="glLabel" required maxlength="60" placeholder="${state.lang === 'sw' ? 'mf. Thibitisha wageni 200' : 'e.g. Confirm 200 RSVPs'}"></div>
    <div class="field"><label>${t('modal.goalTarget')}</label><input type="number" id="glTarget" required min="1" max="10000" value="200"></div>
    <button type="submit" class="btn btn-primary btn-block">${icon('target')}${t('modal.goalBtn')}</button></form>`);
  $('#goalForm').onsubmit = e => {
    e.preventDefault();
    state.goals.push({ id: uid(), label: $('#glLabel').value.trim(), target: Math.max(1, +$('#glTarget').value || 1), current: 0 });
    save(); renderTasks(); closeModal(); toast(t('goal.added'), 'success');
  };
}
function openSchedule() {
  openModal(`${modalClose}<h3>${t('modal.scheduleTitle')}</h3><p class="modal-sub">${t('modal.scheduleSub')}</p>
    <form id="schedForm"><div class="field"><label>${t('profile.date')}</label><input type="date" id="scDate" value="${state.profile.date}" required></div>
    <button type="submit" class="btn btn-primary btn-block">${icon('calendar')}${t('modal.scheduleBtn')}</button></form>`);
  $('#schedForm').onsubmit = e => {
    e.preventDefault();
    state.profile.date = $('#scDate').value; save();
    renderStats(); renderVision(); closeModal(); toast(t('modal.scheduled'), 'success');
  };
}
function openPayments() {
  openModal(`${modalClose}<h3>${t('modal.payTitle')}</h3><p class="modal-sub">${t('modal.paySub')}</p>
    <div class="mm-select">${MM_PROVIDERS.map(m => `<span class="mm-opt selected" style="cursor:default"><i class="mm-dot mm-${m === 'M-Pesa' ? 'mpesa' : m === 'Tigo Pesa' ? 'tigo' : m === 'Airtel Money' ? 'airtel' : 'halo'}"></i>${m}</span>`).join('')}</div>
    <button type="button" class="btn btn-primary btn-block" data-action="close-modal" style="margin-top:18px">${t('modal.done')}</button>`);
}

function addTask(label) {
  if (!label) return;
  state.tasks.push({ id: uid(), label, done: false });
  save(); renderTasks(); toast(t('task.added'), 'success');
}

/* ---------------- chat ---------------- */
let chatMsgs = [];
const CHAT_CHIPS = ['ai.chip1', 'ai.chip2', 'ai.chip3', 'ai.chip4'];
function chatHTML(float) {
  return `
    <div class="chat-head">
      <span class="chat-ava">${icon('sparkles')}</span>
      <div><strong>${t('ai.title')}</strong><small>${t('ai.online')}</small></div>
      ${float ? `<button type="button" class="icon-btn" data-action="close-chat" aria-label="Close">${icon('x')}</button>` : ''}
    </div>
    <div class="chat-messages"></div>
    <div class="chat-chips">${CHAT_CHIPS.map(k => `<button type="button" data-chip="${k}">${t(k)}</button>`).join('')}</div>
    <form class="chat-input"><input type="text" placeholder="${t('ai.ph')}" maxlength="200" autocomplete="off"><button type="submit" class="chat-send" aria-label="Send">${icon('send')}</button></form>`;
}
function mountChats() {
  $('#chatInline').innerHTML = chatHTML(false);
  $('#chatFloat').innerHTML = chatHTML(true);
  renderChat();
}
function renderChat() {
  $$('.chat-messages').forEach(box => {
    box.innerHTML = chatMsgs.map(m => `<div class="msg ${m.role}">${m.html}</div>`).join('');
    box.scrollTop = box.scrollHeight;
  });
}
function chatSay(role, html) { chatMsgs.push({ role, html }); renderChat(); }
function chatTyping(on) {
  $$('.chat-messages').forEach(box => {
    box.querySelector('.typing')?.remove();
    if (on) { box.insertAdjacentHTML('beforeend', '<div class="msg ai typing"><i></i><i></i><i></i></div>'); box.scrollTop = box.scrollHeight; }
  });
}
function miniVendor(v) {
  return `<div class="mini-vendor"><img src="${v.img}" alt=""><div><strong>${esc(v.name)}</strong><small>${esc(regT(v.region))} · ${fmtM(v.price)}</small></div><button type="button" data-action="view" data-id="${v.id}">${t('vendor.view')}</button></div>`;
}
function chatRespond(raw) {
  const q = raw.toLowerCase();
  const sw = state.lang === 'sw';
  const num = (q.match(/(\d[\d,\.]*)\s*(m|mil|million|milioni)?/) || []);
  let amount = 0;
  if (num[1]) { amount = parseFloat(num[1].replace(/,/g, '')); if (num[2]) amount *= 1e6; else if (amount < 1000) amount *= 1e6; }
  const region = REGIONS.find(r => q.includes(r.toLowerCase()) || (r === 'Dar es Salaam' && q.includes('dar')));
  const wants = (...keys) => keys.some(k => q.includes(k));

  if (wants('budget', 'bajeti', 'split', 'gawa', 'ngapi', 'bei ya harusi') || (amount >= 500000 && wants('plan', 'mpango', 'harusi', 'wedding'))) {
    const b = amount >= 500000 ? amount : state.profile.budget;
    const rows = DONUT.map(s => `<tr><td>${t(s.k)}</td><td>${fmtTZS(b * s.pct / 100)}</td></tr>`).join('');
    return `${sw ? `Kwa bajeti ya <strong>${fmtTZS(b)}</strong>, huu mgawanyo unafanya kazi vizuri Tanzania:` : `For a budget of <strong>${fmtTZS(b)}</strong>, here's a split that works beautifully in Tanzania:`}
      <table>${rows}</table>
      <button type="button" class="chat-action" data-chat-action="save-budget" data-amount="${b}">${icon('check')}${t('chat.saveBudget')}</button>`;
  }
  if (wants('checklist', 'orodha', 'timeline', 'ratiba', 'mpango', 'plan my', 'panga')) {
    const items = sw ? ['Weka bajeti na tarehe', 'Hifadhi ukumbi wa sherehe', 'Hifadhi mpiga picha na video', 'Tuma save-the-dates', 'Hifadhi MC na burudani', 'Kamilisha menyu ya chakula', 'Agiza mavazi na henna', 'Thibitisha wageni (RSVP)'] : ['Set budget & date', 'Book ceremony & reception venue', 'Book photographer & film team', 'Send save-the-dates', 'Book MC & entertainment', 'Finalize catering menu & tasting', 'Order attire & henna session', 'Confirm guest RSVPs'];
    return `${sw ? 'Hii hapa orodha ya wiki 12 iliyopangwa kwa siku yako:' : "Here's a 12-week checklist tailored to your day:"}<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
      <button type="button" class="chat-action" data-chat-action="add-checklist">${icon('plus')}${t('chat.addChecklist')}</button>`;
  }
  if (wants('guest', 'wageni', 'catering', 'chakula', 'food', 'menu')) {
    const g = amount >= 10 && amount <= 2000 ? Math.round(amount) : (q.match(/\d+/) ? +q.match(/\d+/)[0] : state.profile.guests);
    const v = state.vendors.find(x => x.id === 'v8');
    const est = bookingTotal(v, 1, g);
    return `${sw ? `Kwa wageni <strong>${g}</strong>, chakula cha Spice Journey kinagharimu takriban <strong>${fmtTZS(est)}</strong> (kwa kila wageni 100). Hii hapa chaguo bora:` : `For <strong>${g} guests</strong>, the Spice Journey menu runs about <strong>${fmtTZS(est)}</strong> (priced per 100 guests). My top pick:`}
      <div class="mini-vendors">${miniVendor(v)}</div>`;
  }
  if (wants('photo', 'picha', 'video', 'film', 'camera')) {
    const list = state.vendors.filter(v => v.category === 'Photography');
    return `${sw ? 'Wapiga picha wangu bora waliothibitishwa:' : 'My top verified photography teams:'}<div class="mini-vendors">${list.map(miniVendor).join('')}</div>`;
  }
  if (wants('venue', 'ukumbi', 'beach', 'fukwe', 'garden', 'bustani', 'hall', 'zanzibar', 'arusha', 'dar', 'mwanza', 'dodoma', 'moshi') || region) {
    let list = state.vendors.filter(v => v.category === 'Venues');
    if (region) list = list.filter(v => v.region === region);
    if (!list.length) list = state.vendors.filter(v => v.category === 'Venues');
    return `${region ? (sw ? `Ukumbi bora huko <strong>${regT(region)}</strong>:` : `Best venues in <strong>${regT(region)}</strong>:`) : (sw ? 'Ukumbi wangu bora Tanzania:' : 'My favorite venues across Tanzania:')}
      <div class="mini-vendors">${list.slice(0, 3).map(miniVendor).join('')}</div>`;
  }
  if (wants('mc', 'host', 'mwenyeji', 'entertainment', 'burudani')) {
    const list = state.vendors.filter(v => v.category === 'MC & Entertainment' || v.category === 'Music & DJ');
    return `${sw ? 'Burudani iliyothibitishwa:' : 'Verified entertainment that keeps the floor full:'}<div class="mini-vendors">${list.map(miniVendor).join('')}</div>`;
  }
  if (wants('date', 'tarehe', 'countdown', 'hesabu', 'days', 'siku ngapi')) {
    const d = daysToWedding();
    return sw ? `Siku <strong>${d}</strong> zimebaki hadi ${fmtDate(state.profile.date)}. Uko kwenye njia nzuri — orodha yako ina kazi ${state.tasks.filter(x => !x.done).length} zinazosubiri.` : `You have <strong>${d} days</strong> until ${fmtDate(state.profile.date)}. You're on track — ${state.tasks.filter(x => !x.done).length} checklist items still open. Want me to build your timeline?`;
  }
  if (wants('mobile money', 'malipo', 'lipa', 'mpesa', 'tigo', 'airtel', 'halo', 'pay', 'deposit', 'amana')) {
    return sw ? 'Kila uhifadhi hulindwa: amana ya 30% hushikiliwa na MY DAY na hulipwa muuzaji baada ya harusi. Tunakubali M-Pesa, Tigo Pesa, Airtel Money na HaloPesa.' : 'Every booking is protected: a 30% deposit is held in escrow by MY DAY and released to your vendor after the wedding. We accept M-Pesa, Tigo Pesa, Airtel Money and HaloPesa — just enter your number at checkout.';
  }
  if (wants('help', 'msaada', 'habari', 'hello', 'hi', 'hey', 'jambo', 'mambo')) {
    return sw ? 'Ninaweza kusaidia na: <ul><li>Kugawa bajeti yako kwa TZS</li><li>Kupata ukumbi, MC, wapiga picha kwa mkoa</li><li>Kujenga orodha ya mipango</li><li>Kukadiria chakula kwa wageni</li></ul> Jaribu kuuliza: "Gawa bajeti ya milioni 20".' : 'I can help with: <ul><li>Splitting your budget in TZS</li><li>Finding venues, MCs & photographers by region</li><li>Building your planning checklist</li><li>Estimating catering for your guest count</li></ul> Try: "Split a 20 million budget".';
  }
  return sw ? 'Naweza kusaidia na bajeti, ukumbi, orodha ya mipango, chakula na burudani. Jaribu: "Ukumbi Zanzibar" au "Gawa bajeti ya milioni 20".' : 'I can help with budgets, venues, checklists, catering and entertainment. Try: "Venues in Zanzibar" or "Split a 20 million budget".';
}
function sendChat(text) {
  if (!text.trim()) return;
  chatSay('user', esc(text.trim()));
  chatTyping(true);
  setTimeout(() => { chatTyping(false); chatSay('ai', chatRespond(text)); }, 650 + Math.random() * 500);
}
function resetChat() { chatMsgs = [{ role: 'ai', html: t('chat.welcome') }]; renderChat(); }

/* ---------------- theme / lang ---------------- */
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const dark = state.theme === 'dark';
  const key = dark ? 'theme.light' : 'theme.dark';
  $('#themeToggle').innerHTML = icon(dark ? 'sun' : 'moon') + `<span data-i18n="${key}">${t(key)}</span>`;
}
function applyLang() {
  closePop();
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  $$('.lang-toggle button').forEach(b => b.classList.toggle('active', b.dataset.lang === state.lang));
  applyTheme();
  renderSelects(); renderChips(); renderVendors(); renderBookings(); renderProfile(); renderNotifs(); renderAuth(); renderDashboard(); mountChats(); resetChat();
  buildMobileMenu(); applyRole(); renderRoleSections();
  applyRole(); renderRoleSections();
  $$('input[type="date"]').forEach(i => { if (i._gdSync) i._gdSync(); });
  if ($('#modalRoot [data-auth]')) openAuth(authView);
}

/* ---------------- roles / vendor dashboard / admin ---------------- */
async function seedInternalAccounts() {
  const defs = [
    { email: 'couple@myday.co.tz', name: 'Amina Hassan', role: 'customer' },
    { email: 'vendor@myday.co.tz', name: 'Zanzi Bloom Studios', role: 'vendor' },
    { email: 'admin@myday.co.tz', name: 'MY DAY Platform Team', role: 'admin', internal: true },
  ];
  let added = false;
  for (const d of defs) if (!findAccount(d.email)) {
    state.accounts.push({ id: uid(), name: d.name, email: d.email, role: d.role, internal: !!d.internal, hash: await hashPass('demo1234'), created: isoDate(new Date()) });
    added = true;
  }
  if (added) save();
}
const userRole = () => (state.user && state.user.role) || 'guest';
function applyRole() {
  const r = userRole();
  const gated = r === 'vendor' || r === 'admin';
  ['#dashboard', '#bookings', '#profile'].forEach(s => $(s) && $(s).classList.toggle('hidden', gated));
  ['#navLinks a[href="#dashboard"]', '#navLinks a[href="#bookings"]', '#navLinks a[href="#profile"]', '#mobileMenu a[href="#dashboard"]', '#mobileMenu a[href="#bookings"]', '#mobileMenu a[href="#profile"]']
    .forEach(s => $$(s).forEach(el => el.classList.toggle('hidden', gated)));
  ['#navLinks a[href="#vendor"]', '#mobileMenu a[href="#vendor"]'].forEach(s => $$(s).forEach(el => el.classList.toggle('hidden', r === 'admin')));
  $$('#navAdminLink, #mobileMenu a[href="#admin"]').forEach(el => el.classList.toggle('hidden', r !== 'admin'));
  const adm = $('#admin'); if (adm) adm.classList.toggle('hidden', r !== 'admin');
  const va = $('#vendorApply'); if (va) va.classList.toggle('hidden', r === 'vendor');
  const vd = $('#vendorDash'); if (vd) vd.classList.toggle('hidden', r !== 'vendor');
}
function renderRoleSections() {
  if (userRole() === 'vendor') renderVendorDash();
  if (userRole() === 'admin') renderAdmin();
}
function renderVendorDash() {
  const wrap = $('#vendorDash'); if (!wrap) return;
  const reqs = state.vendorRequests.filter(r => r.status === 'new');
  const past = state.vendorRequests.filter(r => r.status !== 'new');
  const escrow = state.vendorRequests.filter(r => r.status === 'accepted').reduce((s, r) => s + r.deposit, 0);
  const released = state.bookings.reduce((s, b) => s + b.deposit, 0);
  wrap.innerHTML = `
    <div class="vdash-head"><h3>${t('vdash.title')}</h3><span class="vc-verified">${icon('shield')}${t('vdash.verified')}</span></div>
    <div class="vendor-stats"><div class="vstat glass"><strong>${fmtM(escrow)}</strong><span>${t('vdash.escrow')}</span></div><div class="vstat glass"><strong>${fmtM(released)}</strong><span>${t('vdash.released')}</span></div></div>
    <h4 class="vdash-h">${t('vdash.requests')}</h4>
    ${reqs.length ? reqs.map(r => `<div class="vr-row glass"><div class="vr-info"><strong>${esc(r.couple)}</strong><small>${esc(state.lang === 'sw' ? r.serviceSw : r.service)} · ${r.date} · ${r.guests} 👥</small><span>${fmtM(r.deposit)}</span></div><div class="vr-btns"><button type="button" class="btn btn-primary btn-sm" data-action="vr-accept" data-id="${r.id}">${t('vdash.accept')}</button><button type="button" class="btn btn-glass btn-sm" data-action="vr-decline" data-id="${r.id}">${t('vdash.decline')}</button></div></div>`).join('') : `<p class="modal-sub">${t('vdash.empty')}</p>`}
    ${past.length ? `<h4 class="vdash-h">${t('adm.status')}</h4>` + past.map(r => `<div class="vr-row glass"><div class="vr-info"><strong>${esc(r.couple)}</strong><small>${esc(state.lang === 'sw' ? r.serviceSw : r.service)} · ${r.date}</small></div><span class="fchip ${r.status === 'accepted' ? 'ok' : 'warn'}">${r.status === 'accepted' ? t('vdash.accept') : t('vdash.decline')}</span></div>`).join('') : ''}`;
}
let admTab = 'overview';
const admChip = (label, kind) => `<span class="fchip ${kind}">${label}</span>`;
const admBtn = (labelKey, action, id, cls) => `<button type="button" class="btn ${cls || 'btn-glass'} btn-sm" data-action="${action}" data-id="${esc(id)}">${t(labelKey)}</button>`;
const admTable = (heads, rows) => `<div class="adm-table"><table><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
function renderAdmin() {
  const tabsEl = $('#admTabs'), body = $('#admBody'); if (!tabsEl || !body) return;
  const tabs = ['overview', 'customers', 'vendors', 'bookings', 'complaints', 'cats', 'settings'];
  tabsEl.innerHTML = tabs.map(k => `<button type="button" class="adm-tab ${admTab === k ? 'active' : ''}" data-action="adm-tab" data-id="${k}">${t('adm.' + k)}</button>`).join('');
  const S = state;
  if (admTab === 'overview') {
    const gmv = S.bookings.reduce((s, b) => s + b.total, 0);
    const stats = [[S.accounts.filter(a => (a.role || 'customer') !== 'admin').length, t('adm.custCount')], [S.vendors.length, t('adm.vendorCount')], [S.bookings.length, t('adm.bookCount')], [fmtM(gmv), t('adm.gmv')]];
    body.innerHTML = `<div class="vendor-stats adm-stats">${stats.map(([v, l]) => `<div class="vstat glass"><strong>${v}</strong><span>${l}</span></div>`).join('')}</div>`;
  } else if (admTab === 'customers') {
    body.innerHTML = admTable([t('auth.name'), t('adm.email'), t('adm.role'), t('adm.joined')], S.accounts.map(a => [esc(a.name), esc(a.email), admChip(a.role || 'customer', a.role === 'admin' ? 'warn' : 'ok'), fmtDate(a.created)]));
  } else if (admTab === 'vendors') {
    body.innerHTML = admTable([t('adm.vendor'), t('adm.status'), ''], S.vendors.map(v => [esc(v.name),
      v.suspended ? admChip(t('vdash.suspended'), 'bad') : v.pending ? admChip(t('vdash.pending'), 'warn') : admChip(t('vdash.verified'), 'ok'),
      v.suspended ? admBtn('adm.restore', 'adm-restore', v.id) : v.pending ? admBtn('adm.verify', 'adm-verify', v.id, 'btn-primary') + ' ' + admBtn('adm.suspend', 'adm-suspend', v.id) : admBtn('adm.suspend', 'adm-suspend', v.id)]));
  } else if (admTab === 'bookings') {
    body.innerHTML = admTable([t('adm.couple'), t('adm.vendor'), t('adm.amount'), t('adm.status'), t('adm.date')], S.bookings.map(b => {
      const v = S.vendors.find(x => x.id === b.vendorId);
      return [esc(S.profile.p1 + ' & ' + S.profile.p2), esc(v ? v.name : '—'), fmtM(b.total), admChip(b.status, 'ok'), b.date];
    }));
  } else if (admTab === 'complaints') {
    const rows = S.complaints.map(c => `<div class="vr-row glass"><div class="vr-info"><strong>${esc(c.who)}</strong><small>${esc(state.lang === 'sw' ? c.sw : c.en)}</small></div>${c.status === 'open' ? admBtn('adm.resolve', 'adm-resolve', c.id, 'btn-primary') : admChip(t('adm.resolved'), 'ok')}</div>`);
    body.innerHTML = rows.length ? rows.join('') : `<p class="modal-sub">${t('adm.noComplaints')}</p>`;
  } else if (admTab === 'cats') {
    const cats = [...new Set(S.vendors.map(v => v.category))];
    body.innerHTML = `<div class="chip-row">${cats.map(c => `<span class="fchip">${esc(c)}</span>`).join('')}</div>
      <div class="chip-row" style="margin-top:10px">${S.regions.map(r => `<span class="fchip region-chip">${esc(r)}<button type="button" class="chip-x" data-action="adm-delregion" data-id="${esc(r)}" aria-label="${t('adm.remove')}">${icon('x')}</button></span>`).join('')}</div>
      <div class="field" style="margin-top:12px"><input type="text" id="admRegion" maxlength="24" placeholder="${t('adm.addRegion')}"></div>
      <button type="button" class="btn btn-glass" data-action="adm-addregion">${icon('plus')}${t('adm.addRegion')}</button>`;
  } else {
    const st = S.settings;
    body.innerHTML = `<label class="set-row"><input type="checkbox" data-action="adm-set" data-id="escrow" ${st.escrow ? 'checked' : ''}><span>${t('adm.escrowOn')}</span></label>
      <label class="set-row"><input type="checkbox" data-action="adm-set" data-id="verifyReq" ${st.verifyReq ? 'checked' : ''}><span>${t('adm.verifyReq')}</span></label>
      <label class="set-row"><span>${t('adm.fee')}</span><input type="number" min="0" max="30" value="${st.fee}" data-action="adm-fee"></label>`;
  }
}

/* ---------------- nav / scroll / parallax ---------------- */
function buildMobileMenu() {
  $('#mobileMenu').innerHTML = $$('#navLinks .nav-link').map(a => a.outerHTML).join('');
  placeNavExtras();
}
const mqNavExtras = window.matchMedia('(max-width:760px)');
function placeNavExtras() {
  const extras = $('#navExtras');
  if (!extras) return;
  if (mqNavExtras.matches) $('#mobileMenu').appendChild(extras);
  else $('#loginBtn').before(extras);
}
mqNavExtras.addEventListener('change', placeNavExtras);
function initScroll() {
  const wrap = $('#navWrap');
  const backTop = $('#backTop');
  const ring = $('.bt-ring');
  const onScroll = () => {
    wrap.classList.toggle('scrolled', scrollY > 12);
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    backTop.classList.toggle('show', scrollY > 480);
    ring.style.strokeDashoffset = (119.4 * (1 - p)).toFixed(1);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
  const links = $$('.nav-link');
  const map = {};
  links.forEach(l => { const id = l.getAttribute('href').slice(1); (map[id] = map[id] || []).push(l); });
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        (map[en.target.id] || []).forEach(l => l.classList.add('active'));
      }
    });
  }, { rootMargin: '-38% 0px -55% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));
  const rev = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } }), { threshold: .1 });
  $$('.reveal').forEach(el => rev.observe(el));
}
function initParallax() {
  if (reducedMotion) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('pointermove', e => {
    if (innerWidth < 760) return;
    tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2;
  }, { passive: true });
  const items = $$('.float-item');
  (function loop() {
    cx += (tx - cx) * .055; cy += (ty - cy) * .055;
    items.forEach(el => { const d = +el.dataset.depth || 30; el.style.transform = `translate3d(${(cx * d).toFixed(1)}px,${(cy * d).toFixed(1)}px,0)`; });
    requestAnimationFrame(loop);
  })();
}

/* ---------------- global events ---------------- */
function initEvents() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (el) {
      const a = el.dataset.action, id = el.dataset.id;
      if (a === 'view') { openDrawer(id); }
      else if (a === 'book') { openBooking(id, drawerVendor && drawerVendor.id === id ? drawerPkg : 0); }
      else if (a === 'pkg') { drawerPkg = +el.dataset.i; $$('.pkg').forEach((p, i) => p.classList.toggle('selected', i === drawerPkg)); $('#dfPrice').textContent = fmtM(drawerVendor.packages[drawerPkg].price) + (drawerVendor.perHead ? ' /100' : ''); }
      else if (a === 'close-drawer') closeDrawer();
      else if (a === 'close-modal') closeModal();
      else if (a === 'goto-bookings') { closeModal(); closeDrawer(); location.hash = '#bookings'; }
      else if (a === 'logout') { state.user = null; save(); renderAuth(); renderStats(); applyRole(); renderRoleSections(); closeModal(); toast(t('auth.logoutDone'), 'success'); }
      else if (a === 'vr-accept') { const r = state.vendorRequests.find(x => x.id === id); if (r) { r.status = 'accepted'; save(); renderVendorDash(); toast(t('vdash.accepted'), 'success'); } }
      else if (a === 'vr-decline') { const r = state.vendorRequests.find(x => x.id === id); if (r) { r.status = 'declined'; save(); renderVendorDash(); toast(t('vdash.declined'), 'info'); } }
      else if (a === 'adm-tab') { admTab = id; renderAdmin(); }
      else if (a === 'adm-verify') { const v = state.vendors.find(x => x.id === id); if (v) { v.pending = false; v.verified = true; save(); renderAdmin(); renderVendors(); toast(t('adm.verified'), 'success'); } }
      else if (a === 'adm-suspend') { const v = state.vendors.find(x => x.id === id); if (v) { v.suspended = true; save(); renderAdmin(); renderVendors(); toast(t('adm.suspendedV'), 'info'); } }
      else if (a === 'adm-restore') { const v = state.vendors.find(x => x.id === id); if (v) { v.suspended = false; save(); renderAdmin(); renderVendors(); toast(t('adm.restored'), 'success'); } }
      else if (a === 'adm-resolve') { const c = state.complaints.find(x => x.id === id); if (c) { c.status = 'resolved'; save(); renderAdmin(); toast(t('adm.resolvedC'), 'success'); } }
      else if (a === 'adm-delregion') { if (state.regions.length > 1) { state.regions = state.regions.filter(r => r !== id); save(); renderAdmin(); renderSelects(); toast(t('adm.regionRemoved'), 'info'); } }
      else if (a === 'adm-addregion') { const v = ($('#admRegion')?.value || '').trim(); if (v && !state.regions.includes(v)) { state.regions.push(v); save(); renderAdmin(); renderSelects(); toast(t('adm.regionAdded'), 'success'); } }
      else if (a === 'adm-set') { state.settings[id] = el.checked; save(); }
      else if (a === 'close-chat') $('#chatFloat').classList.add('hidden');
      else if (a === 'toggle-task') {
        const x = state.tasks.find(v => v.id === id); if (!x) return;
        x.done = !x.done;
        const di = (new Date().getDay() + 6) % 7;
        state.weekThis[di] = Math.max(0, state.weekThis[di] + (x.done ? 1 : -1));
        save(); renderTasks(); renderBars();
      }
      else if (a === 'del-task') {
        const i = state.tasks.findIndex(v => v.id === id); if (i < 0) return;
        const [gone] = state.tasks.splice(i, 1);
        save(); renderTasks();
        toast(t('task.deleted'), 'info', () => { state.tasks.splice(Math.min(i, state.tasks.length), 0, gone); save(); renderTasks(); toast(t('task.restored'), 'success'); });
      }
      else if (a === 'goal-inc') {
        const g = state.goals.find(v => v.id === id); if (!g) return;
        g.current = Math.min(g.target, g.current + 1); save(); renderTasks();
        if (g.current >= g.target) toast(t('goal.done'), 'success');
      }
      else if (a === 'cancel-booking') {
        const b = state.bookings.find(v => v.id === id); if (!b || b.status === 'cancelled') return;
        b.status = 'cancelled'; state.profile.budgetUsed = Math.max(0, state.profile.budgetUsed - b.deposit);
        save(); renderBookings(); renderDashboard();
        toast(t('bookings.cancelToast'), 'info', () => { b.status = 'confirmed'; state.profile.budgetUsed += b.deposit; save(); renderBookings(); renderDashboard(); toast(t('bookings.restored'), 'success'); });
      }
      else if (a === 'task') openTaskModal();
      else if (a === 'invite') openInvite();
      else if (a === 'goal') openGoal();
      else if (a === 'schedule') openSchedule();
      return;
    }
    const chip = e.target.closest('[data-chip]');
    if (chip) { sendChat(t(chip.dataset.chip)); return; }
    const ca = e.target.closest('[data-chat-action]');
    if (ca) {
      if (ca.dataset.chatAction === 'save-budget') {
        state.profile.budget = +ca.dataset.amount; save(); renderDashboard(); renderProfile();
        chatSay('ai', `${icon('check')} ${t('chat.budgetSaved')} — <strong>${fmtTZS(state.profile.budget)}</strong>.`);
        toast(t('chat.budgetSaved'), 'success');
      } else if (ca.dataset.chatAction === 'add-checklist') {
        const extra = state.lang === 'sw' ? ['Thibitisha wageni (RSVP)', 'Panga usafiri wa wageni', 'Kagua mipango ya mvua (backup)'] : ['Confirm guest RSVPs', 'Arrange guest transport', 'Review rain backup plan'];
        extra.forEach(l => { if (!state.tasks.some(x => x.label === l)) state.tasks.push({ id: uid(), label: l, done: false }); });
        save(); renderTasks();
        chatSay('ai', `${icon('check')} ${t('chat.checklistAdded')}.`);
        toast(t('chat.checklistAdded'), 'success');
      }
      return;
    }
    const cat = e.target.closest('[data-cat]');
    if (cat) { filters.category = cat.dataset.cat; renderChips(); renderVendors(); $('#fCategory').value = filters.category; $('#fCategory')._gsSync(); return; }
    const th = e.target.closest('[data-theme]');
    if (th && th.closest('#themeChips')) { state.profile.theme = th.dataset.theme; $$('#themeChips .chip').forEach(c => c.classList.toggle('active', c === th)); return; }
    const fl = e.target.closest('[data-filter-link]');
    if (fl) { filters.category = fl.dataset.filterLink; renderChips(); renderVendors(); $('#fCategory').value = filters.category; $('#fCategory')._gsSync(); return; }
    if (!e.target.closest('.bell-wrap')) $('#notifPanel').classList.add('hidden');
    if (!e.target.closest('#mobileMenu') && !e.target.closest('#menuBtn')) $('#mobileMenu').classList.add('hidden');
  });

  document.addEventListener('submit', e => {
    if (e.target.classList.contains('chat-input')) {
      e.preventDefault();
      const inp = e.target.querySelector('input');
      sendChat(inp.value); inp.value = '';
    }
  });

  $('#heroSearch').addEventListener('submit', e => {
    e.preventDefault();
    filters.q = $('#q').value; filters.category = $('#fCategory').value; filters.region = $('#fRegion').value; filters.date = $('#fDate').value;
    renderChips(); renderVendors();
    location.hash = '#services';
  });
  $('#q').addEventListener('input', e => { filters.q = e.target.value; renderVendors(); });
  $('#fCategory').addEventListener('change', e => { filters.category = e.target.value; renderChips(); renderVendors(); });
  $('#fRegion').addEventListener('change', e => { filters.region = e.target.value; renderVendors(); });
  $('#sortSel').addEventListener('change', e => { filters.sort = e.target.value; renderVendors(); });
  $('#clearFilters').addEventListener('click', () => { filters.q = filters.category = filters.region = ''; $('#q').value = ''; $('#fCategory').value = ''; $('#fRegion').value = ''; $('#fCategory')._gsSync(); $('#fRegion')._gsSync(); renderChips(); renderVendors(); });
  $('#dashSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') { filters.q = e.target.value; $('#q').value = filters.q; renderVendors(); location.hash = '#services'; }
  });
  $('#rangeSel').addEventListener('change', e => { state.range = e.target.value; save(); renderArea(); });
  $('#weekSel').addEventListener('change', e => { state.week = e.target.value; save(); renderBars(); });
  $('#taskAdd').addEventListener('submit', e => { e.preventDefault(); addTask($('#taskInput').value.trim()); $('#taskInput').value = ''; });

  $('#profileForm').addEventListener('submit', e => {
    e.preventDefault();
    const p = state.profile;
    p.p1 = $('#p1').value.trim() || p.p1; p.p2 = $('#p2').value.trim() || p.p2;
    p.date = $('#pDate').value || p.date; p.region = $('#pRegion').value;
    p.budget = Math.max(500000, +$('#pBudget').value || p.budget);
    p.guests = Math.max(10, +$('#pGuests').value || p.guests);
    p.confirmed = Math.min(p.guests, Math.max(0, +$('#pConfirmed').value || 0));
    save(); renderProfile(); renderDashboard(); renderAvatars();
    toast(t('profile.saved'), 'success');
  });

  $('#vendorForm').addEventListener('submit', e => {
    e.preventDefault();
    const phone = $('#vPhone').value.replace(/\s/g, '');
    if (!/^(\+?255|0)\d{9}$/.test(phone)) { toast(t('vendor.badPhone'), 'warn'); return; }
    const mm = $$('#vendorForm input[name="mm"]:checked').map(c => c.value);
    if (!mm.length) { toast(t('vendor.mmRequired'), 'warn'); return; }
    const cat = $('#vCategory').value;
    const price = Math.max(50000, +$('#vPrice').value || 50000);
    state.vendors.unshift({
      id: uid(), name: $('#vName').value.trim(), category: cat, region: $('#vRegion').value,
      price, rating: 0, reviews: 0, img: CAT_IMG[cat], verified: false, pending: true, mm,
      desc: $('#vDesc').value.trim(), amenities: mm, packages: [{ name: 'Standard', price, desc: 'Introductory package' }],
    });
    save(); renderVendors(); e.target.reset();
    $$('select', e.target).forEach(sel => sel._gsSync());
    toast(t('vendor.applied'), 'success');
    location.hash = '#services';
  });

  $('#themeToggle').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); renderArea(); renderDonut(); renderBars(); });
  $$('.lang-toggle button').forEach(b => b.addEventListener('click', () => { if (state.lang !== b.dataset.lang) { state.lang = b.dataset.lang; save(); applyLang(); } }));
  $('#bellBtn').addEventListener('click', () => { $('#notifPanel').classList.toggle('hidden'); });
  $('#markRead').addEventListener('click', () => { state.notifications.forEach(n => n.unread = false); save(); renderNotifs(); });
  $('#loginBtn').addEventListener('click', () => openAuth());
  $('#menuBtn').addEventListener('click', () => $('#mobileMenu').classList.toggle('hidden'));
  $('#mobileMenu').addEventListener('click', e => { if (e.target.closest('.nav-link')) $('#mobileMenu').classList.add('hidden'); });
  $('#heroPlanBtn').addEventListener('click', () => { $('#chatFloat').classList.remove('hidden'); setTimeout(() => $('#chatFloat input')?.focus(), 120); });
  $('#aiBubble').addEventListener('click', () => { $('#chatFloat').classList.toggle('hidden'); if (!$('#chatFloat').classList.contains('hidden')) setTimeout(() => $('#chatFloat input')?.focus(), 120); });
  $('#footerHelp').addEventListener('click', () => { $('#chatFloat').classList.remove('hidden'); sendChat(state.lang === 'sw' ? 'msaada' : 'help'); });
  $('#footerPayments').addEventListener('click', e => { e.preventDefault(); openPayments(); });
  $('#drawerOverlay').addEventListener('click', closeDrawer);
  $('#modalOverlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (openPop) { closePop(); return; }
      closeModal(); closeDrawer(); $('#chatFloat').classList.add('hidden'); $('#notifPanel').classList.add('hidden'); $('#mobileMenu').classList.add('hidden');
    }
  });
}

/* ---------------- init ---------------- */
document.addEventListener('change', e => {
  const el = e.target.closest('[data-action="adm-fee"]');
  if (el) { state.settings.fee = Math.max(0, Math.min(30, +el.value || 0)); save(); }
});
applyTheme();
applyLang();
enhancePickers(document);
initEvents();
initScroll();
initParallax();
seedInternalAccounts().then(() => { renderAuth(); applyRole(); renderRoleSections(); });
save();