/*
 * IslaKeys demo auth + data layer.
 * There is no backend: accounts, sessions, inquiries and notes live in localStorage.
 * Loaded by login.html and every portal page before their own inline scripts.
 */
(function (global) {
    'use strict';

    var KEYS = {
        users: 'islakeysUsers',
        session: 'islakeysSession',
        inquiries: 'islakeysInquiries',
        saved: 'islakeysSaved',
        draft: 'islakeysClientDraft',
        notes: 'islakeysBrokerNotes',
        contact: 'islakeysContactMessages'
    };

    var ROLES = ['admin', 'client', 'broker'];

    var DEMO_USERS = [
        { role: 'admin', name: 'IslaKeys Admin', email: 'admin@islakeys.ph', password: 'admin12345' },
        { role: 'client', name: 'Client Test', email: 'client.test@islakeys.ph', password: 'client123' },
        { role: 'broker', name: 'Broker Test', email: 'broker.test@islakeys.ph', password: 'broker123' }
    ];

    var PROPERTIES = [
        { id: 'makati-condo', name: 'Makati Luxury Condo', location: 'Makati CBD', price: 'PHP 18.5M' },
        { id: 'bgc-skyline', name: 'BGC Skyline Condo', location: 'Bonifacio Global City', price: 'PHP 24M' },
        { id: 'tagaytay-villa', name: 'Tagaytay Villa', location: 'Tagaytay', price: 'PHP 32M' },
        { id: 'palawan-beach', name: 'Palawan Beach House', location: 'El Nido, Palawan', price: 'PHP 45M' },
        { id: 'cebu-ocean', name: 'Cebu Ocean Condo', location: 'Mactan, Cebu', price: 'PHP 11.8M' }
    ];

    var LOGIN_PAGE = {
        admin: 'login.html',
        client: 'login.html?role=client',
        broker: 'login.html?role=broker'
    };

    var DASHBOARDS = {
        admin: 'admin-dashboard/index.html',
        client: 'client-dashboard/index.html',
        broker: 'licensed-broker/index.html'
    };

    function read(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            if (raw === null) {
                return fallback;
            }
            var value = JSON.parse(raw);
            return value === null || value === undefined ? fallback : value;
        } catch (_error) {
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (_error) {
            return false;
        }
    }

    function remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (_error) {
            // Storage unavailable: nothing to remove.
        }
    }

    function copy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function isValidUser(user) {
        return !!user && typeof user.email === 'string' && typeof user.name === 'string' &&
            typeof user.password === 'string' && ROLES.indexOf(user.role) !== -1;
    }

    function seedInquiries() {
        var now = Date.now();
        var day = 24 * 60 * 60 * 1000;
        return [
            {
                id: 'inq-seed-1',
                clientEmail: 'client.test@islakeys.ph',
                clientName: 'Client Test',
                propertyId: 'bgc-skyline',
                message: 'Is the BGC Skyline unit still available for a viewing this Saturday?',
                createdAt: new Date(now - 3 * day).toISOString(),
                status: 'replied',
                reply: 'Yes, Saturday at 10 AM works. I will send the building pass details the day before.',
                brokerName: 'Broker Test',
                repliedAt: new Date(now - 2 * day).toISOString()
            },
            {
                id: 'inq-seed-2',
                clientEmail: 'client.test@islakeys.ph',
                clientName: 'Client Test',
                propertyId: 'palawan-beach',
                message: 'Can a foreign buyer hold the Palawan beach house directly, or is a long-term lease needed?',
                createdAt: new Date(now - day).toISOString(),
                status: 'open'
            },
            {
                id: 'inq-seed-3',
                clientEmail: 'maria.santos@example.com',
                clientName: 'Maria Santos',
                propertyId: 'cebu-ocean',
                message: 'Looking for a 2-bedroom ocean-view unit under PHP 12M. Can we schedule a call this week?',
                createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
                status: 'open'
            }
        ];
    }

    /* Make sure demo accounts and sample data exist, repairing malformed storage. */
    function ensureSeed() {
        var users = read(KEYS.users, null);
        users = Array.isArray(users) ? users.filter(isValidUser) : [];
        DEMO_USERS.forEach(function (demo) {
            var exists = users.some(function (u) { return u.email.toLowerCase() === demo.email; });
            if (!exists) {
                users.push(copy(demo));
            }
        });
        write(KEYS.users, users);

        if (!Array.isArray(read(KEYS.inquiries, null))) {
            write(KEYS.inquiries, seedInquiries());
        }

        var saved = read(KEYS.saved, null);
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
            write(KEYS.saved, { 'client.test@islakeys.ph': ['makati-condo', 'tagaytay-villa', 'palawan-beach'] });
        }
    }

    function getUsers() {
        var users = read(KEYS.users, []);
        return Array.isArray(users) ? users.filter(isValidUser) : [];
    }

    function saveUsers(users) {
        return write(KEYS.users, users);
    }

    function findUser(email) {
        var needle = String(email || '').trim().toLowerCase();
        return getUsers().filter(function (u) { return u.email.toLowerCase() === needle; })[0] || null;
    }

    /* Put demo accounts back to their original credentials; other accounts are kept. */
    function restoreDemoUsers() {
        var demoEmails = DEMO_USERS.map(function (d) { return d.email; });
        var others = getUsers().filter(function (u) { return demoEmails.indexOf(u.email.toLowerCase()) === -1; });
        saveUsers(copy(DEMO_USERS).concat(others));
    }

    function getSession() {
        var session = read(KEYS.session, null);
        if (!session || typeof session !== 'object' || ROLES.indexOf(session.role) === -1 ||
            typeof session.name !== 'string' || typeof session.email !== 'string') {
            return null;
        }
        return session;
    }

    function setSession(user) {
        var session = {
            role: user.role,
            name: user.name,
            email: user.email,
            loggedInAt: new Date().toISOString()
        };
        write(KEYS.session, session);
        return session;
    }

    function clearSession() {
        remove(KEYS.session);
    }

    /*
     * Guard for portal pages (they live one folder below the site root).
     * Returns the session when it matches the role; otherwise redirects to login and returns null.
     */
    function requireRole(role) {
        var session = getSession();
        if (!session || session.role !== role) {
            global.location.replace('../' + LOGIN_PAGE[role]);
            return null;
        }
        // If the user logs out and then presses Back, re-check instead of showing a cached page.
        global.addEventListener('pageshow', function (event) {
            var current = getSession();
            if (event.persisted && (!current || current.role !== role)) {
                global.location.replace('../' + LOGIN_PAGE[role]);
            }
        });
        return session;
    }

    function logout(role) {
        clearSession();
        var target = LOGIN_PAGE[role] || 'login.html';
        target += (target.indexOf('?') === -1 ? '?' : '&') + 'loggedout=1';
        global.location.href = '../' + target;
    }

    function escapeHtml(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(iso) {
        var date = new Date(iso);
        return isNaN(date.getTime()) ? '' : date.toLocaleString();
    }

    function getProperty(id) {
        return PROPERTIES.filter(function (p) { return p.id === id; })[0] || null;
    }

    function getInquiries() {
        var list = read(KEYS.inquiries, []);
        return Array.isArray(list) ? list.filter(function (i) { return i && i.id && i.message; }) : [];
    }

    function saveInquiries(list) {
        return write(KEYS.inquiries, list);
    }

    function getSaved(email) {
        var all = read(KEYS.saved, {});
        var list = all && typeof all === 'object' && Array.isArray(all[email]) ? all[email] : [];
        return list.filter(function (id) { return !!getProperty(id); });
    }

    function setSaved(email, ids) {
        var all = read(KEYS.saved, {});
        if (!all || typeof all !== 'object' || Array.isArray(all)) {
            all = {};
        }
        all[email] = ids;
        return write(KEYS.saved, all);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
    }

    function uid(prefix) {
        return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    ensureSeed();

    global.IslaKeys = {
        KEYS: KEYS,
        DEMO_USERS: DEMO_USERS,
        PROPERTIES: PROPERTIES,
        DASHBOARDS: DASHBOARDS,
        read: read,
        write: write,
        remove: remove,
        ensureSeed: ensureSeed,
        getUsers: getUsers,
        saveUsers: saveUsers,
        findUser: findUser,
        restoreDemoUsers: restoreDemoUsers,
        getSession: getSession,
        setSession: setSession,
        clearSession: clearSession,
        requireRole: requireRole,
        logout: logout,
        escapeHtml: escapeHtml,
        formatDate: formatDate,
        getProperty: getProperty,
        getInquiries: getInquiries,
        saveInquiries: saveInquiries,
        getSaved: getSaved,
        setSaved: setSaved,
        isValidEmail: isValidEmail,
        uid: uid
    };
})(window);
