# Quick Reference: User Authentication & Parameterization

**Date**: 2026-02-05  
**For**: O2C-INDENT-TC-012 and future tests

---

## ✅ What Changed?

### 1. **BDD Generation** - Already Working!
```bash
# Automatic (recommended)
npm test  # Auto-runs bddgen via pretest

# Manual
npm run bdd:generate
npx bddgen
```

### 2. **User Authentication** - Now User-Specific!
```gherkin
# Feature file now clearly identifies which user
Background:
  Given I am logged in as "IACS MD User"  # ✅ Explicit user context
```

### 3. **Dealer Name** - Now Parameterized!
```gherkin
# Changed from hardcoded to actual dealer name
When I search for dealer by name "Green Valley"      # ✅ Clear search term
And I should see "Green Valley" in the results        # ✅ Verifiable
When I select the dealer "Green Valley Agri Center"  # ✅ Full dealer name
```

---

## 🚀 How to Run the Test

```bash
# Run O2C Indent test with IACS MD User
npm run test:dev -- --grep "@O2C-INDENT-TC-012"
```

**Expected Console Output**:
```
📋 Test Context: Running as "IACS MD User" (md@idhyahagri.com)
🔐 Auth Method: Pre-authenticated session (storageState)
✅ Navigated to O2C Indents page
✅ Clicked Create Indent button
✅ Verified "Select Dealer" modal is visible
✅ Modal displays 7 active dealers
✅ Search input is visible and enabled
✅ Searched for dealer: "Green Valley"
✅ Dealer list is filtered
✅ Verified "Green Valley" appears in results
✅ Selected dealer: "Green Valley Agri Center"
✅ Modal closed
✅ On indent creation page with dealer pre-selected
```

---

## 📋 Test Audit Trail

**What Auditors Will See**:

| Step | Details | Audit Value |
|------|---------|-------------|
| **User Context** | `Given I am logged in as "IACS MD User"` | ✅ Clear who is testing |
| **User Email** | `md@idhyahagri.com` | ✅ Specific account used |
| **Search Term** | `"Green Valley"` | ✅ What was searched |
| **Verification** | `I should see "Green Valley" in results` | ✅ What was verified |
| **Selection** | `"Green Valley Agri Center"` | ✅ What was selected |

---

## 🔐 Authentication Files

After first run, these files are created:

```
e2e/.auth/
├── admin.json      # Super Admin (default for most tests)
├── iacs-md.json    # IACS MD User (for O2C tests) ✅ NEW
```

**O2C tests automatically use IACS MD User** (configured in `playwright.config.ts`).

---

## 📝 How to Add More Users

### Step 1: Add Credentials to `.env.local`
```bash
# New user credentials
NEW_USER_EMAIL=newuser@daee.in
NEW_USER_PASSWORD=password123
NEW_USER_TOTP_SECRET=XXXXXXXXXXXX
```

### Step 2: Add Profile to `auth-profiles.setup.ts`
```typescript
{
  name: 'New User Role',
  emailEnv: 'NEW_USER_EMAIL',
  passwordEnv: 'NEW_USER_PASSWORD',
  totpSecretEnv: 'NEW_USER_TOTP_SECRET',
  filename: 'new-user.json',
},
```

### Step 3: Add to Background Step Map in `auth-background-steps.ts`
```typescript
'New User Role': {
  email: process.env.NEW_USER_EMAIL || 'newuser@daee.in',
  env: 'NEW_USER',
},
```

### Step 4: Use in Feature Files
```gherkin
Background:
  Given I am logged in as "New User Role"
```

---

## 📝 How to Test Different Dealers

Just change the dealer name in the feature file:

```gherkin
# Option 1: Search by partial name
When I search for dealer by name "Kisan"
And I should see "Kisan" in the results
When I select the dealer "Kisan Krushi Kendra"

# Option 2: Search by dealer code
When I search for dealer by name "GVAC-001"
And I should see "GVAC-001" in the results
When I select the dealer "Green Valley Agri Center"

# Option 3: Search by GST
When I search for dealer by name "37BBBB"
And I should see "37BBBB" in the results
When I select the dealer "Green Valley Agri Center"
```

**No code changes needed** - just update the feature file!

---

## 🎯 Available User Roles

| Role | Usage | Auth File |
|------|-------|-----------|
| **IACS MD User** | O2C module tests | `iacs-md.json` |
| **Super Admin** | General tests | `admin.json` |
| **Finance Manager** | Finance tests | `finance.json` (if configured) |
| **Warehouse Manager** | Warehouse tests | `warehouse.json` (if configured) |

---

## 🔍 Supported Dealers (From Screenshot)

These dealers are available in the test environment:

| Dealer Code | Company Name | GST Number |
|-------------|--------------|------------|
| **GVAC-001** | Green Valley Agri Center | 37BBBB1111B1Z5 |
| **KKK-002** | Kisan Krushi Kendra | 37CCCC2222C1Z5 |
| **NFCS-003** | Nandyal Farmers Cooperative Society | 37AAAC1681G4ZL |
| **GSTZEN-37AAD** | GSTZEN SANDBOX DEALER | 37AADCG4992P2ZR |
| **TEST02** | CENTRAL WARE HOUSING CORP.LTD. | 24AAACC1206D1ZK |
| **N/A** | VAYUPUTRA FERTILIZERS,PESTICIDES,SEEDS | 36FXQPR1049A1ZC |
| **DLR002** | Kisan Agro Center | 29AABCK5678M2Z6 |

---

## ⚡ Quick Commands

```bash
# Regenerate BDD tests after feature file changes
npm run bdd:generate

# Run specific test
npm run test:dev -- --grep "@O2C-INDENT-TC-012"

# Run all O2C tests
npm run test:dev -- --grep "@O2C-"

# Run with specific user (already configured for O2C)
npm run test:dev -- --project=chromium-o2c

# Verify auth files exist
ls -lh e2e/.auth/
```

---

## 📊 Test Report Output

**What you'll see in reports**:

```
Test: O2C-INDENT-TC-012
User: IACS MD User (md@idhyahagri.com)
Browser: Chromium
Duration: 3.5s

Steps:
  ✅ Given I am logged in as "IACS MD User"
  ✅ Given I am on the O2C Indents page
  ✅ When I click the Create Indent button
  ✅ Then I should see the "Select Dealer" modal
  ✅ And the modal should display a list of active dealers
  ✅ And the modal should have a search input
  ✅ When I search for dealer by name "Green Valley"
  ✅ Then the dealer list should be filtered
  ✅ And I should see "Green Valley" in the results
  ✅ When I select the dealer "Green Valley Agri Center"
  ✅ Then the modal should close
  ✅ And I should be on the indent creation page
```

---

## ✅ Checklist: Did It Work?

After running the test, verify:

- [ ] Console shows: `📋 Test Context: Running as "IACS MD User"`
- [ ] Console shows: `🔐 Auth Method: Pre-authenticated session`
- [ ] Console shows: `✅ Searched for dealer: "Green Valley"`
- [ ] Console shows: `✅ Selected dealer: "Green Valley Agri Center"`
- [ ] Test passes without errors
- [ ] Auth file exists: `e2e/.auth/iacs-md.json`

---

**Need Help?**

📖 Full Documentation: `MULTI_USER_AUTH_AND_PARAMETERIZATION_2026-02-05.md`  
🐛 Troubleshooting: See "Troubleshooting" section in full documentation

---

**Status**: ✅ **READY TO USE**
