const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const app = readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const auth = readFileSync(path.join(__dirname, '../firebase-auth.js'), 'utf8');
const entryCode = app.slice(app.indexOf('async function handleAuthenticatedEntry('), app.indexOf('\nwindow.addEventListener(', app.indexOf('async function handleAuthenticatedEntry(')));
function element() {
    const classes = new Set();
    return { style: {}, classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) }, disabled: false, textContent: '' };
}
function fixture() {
    const elements = Object.fromEntries(['entryStatus', 'entryMessage', 'retryEntryButton'].map(id => [id, element()]));
    const context = {
        document: { getElementById: id => elements[id] },
        window: { HCFirebaseData: {}, scrollTo() {}, requestAnimationFrame: cb => cb() },
        updateDeveloperUI() {}, welcomeExperience: element(), mainApp: element(), welcomeNav: element(),
        refreshFirestoreCommunityState: async () => {}, refreshFirestorePosts: async () => {},
        console: { error() {} }, setTimeout: cb => cb(), showAppPage: name => { context.page = name; }
    };
    vm.createContext(context); vm.runInContext(entryCode, context);
    return { context, elements };
}
test('failed startup shows recovery and permits successful retry', async () => {
    const { context, elements } = fixture();
    let resets = 0;
    const event = { detail: { onFailure: () => resets++ } };
    context.refreshFirestorePosts = async () => { throw Object.assign(new Error('denied'), { code: 'permission-denied' }); };
    await context.handleAuthenticatedEntry(event);
    assert.equal(resets, 1);
    assert.equal(elements.retryEntryButton.disabled, false);
    assert.equal(elements.entryStatus.classList.contains('hidden'), false);
    assert.match(elements.entryMessage.textContent, /administrator/);
    assert.equal(context.page, undefined);
    context.refreshFirestorePosts = async () => {};
    await context.handleAuthenticatedEntry(event);
    assert.equal(context.page, 'home');
    assert.equal(elements.entryStatus.classList.contains('hidden'), true);
});
test('network errors give connection guidance', async () => {
    const { context, elements } = fixture();
    context.refreshFirestoreCommunityState = async () => { throw new Error('offline'); };
    await context.handleAuthenticatedEntry({ detail: {} });
    assert.match(elements.entryMessage.textContent, /connection/);
    assert.equal(elements.retryEntryButton.disabled, false);
});
test('community validation rejects inputs disallowed by supplied rules before writing', async () => {
    const start = auth.indexOf('async function createCommunityInFirestore(');
    const end = auth.indexOf('\n\nfunction timestampToMillis', start);
    const context = { requireVerifiedUser: () => ({ uid: 'test' }) };
    vm.createContext(context); vm.runInContext(auth.slice(start, end), context);
    const valid = { name: 'Chess', icon: '♟', category: 'OTHER', description: 'Play chess.' };
    for (const input of [{ ...valid, name: 'A' }, { ...valid, category: 'INVALID' }, { ...valid, description: 'x'.repeat(181) }]) {
        await assert.rejects(context.createCommunityInFirestore(input), /community name/);
    }
});
