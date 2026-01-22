# 🎯 QUICK VISUAL GUIDE

## What You Need to Do (2 Steps)

### STEP 1: Enable eSIM
```
Portal Left Sidebar → SIM Cards
↓
Find: ICCID 89311210000005749297
↓
Click the SIM card
↓
Click: "Enable" button
Toggle: Voice ON
Toggle: Data ON
↓
Save
↓
WAIT 3 MINUTES
```

### STEP 2: Change Number Routing
```
Portal Left Sidebar → Phone Numbers
↓
Click: +1-321-485-8333
↓
Scroll to "Routing" section
↓
Click dropdown showing "xxxiii-voice"
↓
Select: Your eSIM (shows as "Telnyx SIM" or ICCID)
↓
Scroll down
↓
Click "Save Changes"
↓
DONE! ✅
```

## What Changes

### BEFORE (Current - Not Working)
```
+1-321-485-8333
        ↓
   xxxiii-voice (SIP Connection)
        ↓
   Webhook Server (port 3000)
        ↓
   Cloudflared Tunnel ❌ (keeps dying)
        ↓
   ??? (nowhere - calls ring forever)
```

### AFTER (What You Want - Native)
```
+1-321-485-8333
        ↓
   eSIM (89311210000005749297)
        ↓
   iPhone Cellular Radio
        ↓
   Native Phone App 🔔
        ↓
   RINGS! ✅
```

## Verification

After changing, your iPhone Settings should show:

```
Settings → Cellular
├── Cellular Plans
│   └── Telnyx ✅
│       ├── Phone Number: +1 (321) 485-8333 ✅
│       ├── Turn On This Line: ON ✅
│       └── Cellular Data: ON ✅
```

Test by calling that number from another phone!

---

## Scripts to Run

**Before portal changes:**
```powershell
cd kevan-tel
.\CHECK-IPHONE.ps1  # Shows current status (will show issues)
```

**After portal changes:**
```powershell
.\verify-complete-setup.ps1  # Should show all green ✅
```

---

## Files Reference

- **PORTAL-STEPS-EXACT.md** ← Detailed step-by-step
- **COMPLETE-DIAGNOSIS.md** ← Full explanation of issues
- **verify-complete-setup.ps1** ← Check if working
- **configure-unblocked-esim.ps1** ← Auto-config (if needed)

---

**Bottom line**: Enable SIM, change dropdown, done. 🎉
