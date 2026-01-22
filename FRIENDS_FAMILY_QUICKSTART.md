# Friends & Family Program - Quick Start Guide

## 1. Generate Access Codes

**Method 1: Web API (Easiest)**

Visit in browser: `http://localhost:3000/api/friends-family/generate-codes`

This will display 100 access codes in JSON format with instructions.

**Method 2: Download CSV**

```powershell
# From y3k-markets-web directory
curl -X POST http://localhost:3000/api/friends-family/generate-codes -o codes.csv
```

## 2. Assign Codes to People

**CSV Structure:**
```csv
Index,Code,Tier,Email,Invited,Used
1,GENESIS-F001-2026,Founder,,,
2,GENESIS-F002-2026,Founder,,,
...
```

Fill in the Email column with your friends & family emails.

**Tier Breakdown:**
- **F001-F010** (Founder) - Closest supporters, family, core team
- **E011-E100** (Early Supporter) - Extended network, advisors, early community

## 3. Send Invitation Emails

**Template:** See [INVITATION_EMAIL_TEMPLATE.md](./INVITATION_EMAIL_TEMPLATE.md)

**Personalization Required:**
- Replace `[First Name]` with recipient's name
- Replace `[GENESIS-XXXX-XXXX]` with their unique code
- Send from a personal email (more trust than automated)

**Recommended Timing:**
- Send 2-4 hours before genesis ceremony
- Example: If ceremony is 6 PM EST, send at 2-4 PM EST
- Gives them time to read and prepare

## 4. Access Window Configuration

**Current Settings** (in `app/api/friends-family/validate/route.ts`):
```typescript
const GENESIS_COMPLETE_TIME = new Date('2026-01-16T20:00:00-05:00'); // 8 PM EST
const ACCESS_WINDOW_END = new Date('2026-01-17T20:00:00-05:00'); // +24 hours
```

**To Adjust:**
1. Edit `validate/route.ts`
2. Change `GENESIS_COMPLETE_TIME` to your actual genesis completion time
3. `ACCESS_WINDOW_END` is automatically +24 hours

## 5. Production Deployment

**Before Going Live:**

1. **Add ALL generated codes to validation endpoint:**
   - Edit `app/api/friends-family/validate/route.ts`
   - Replace test codes with your full list (100 codes)
   
2. **Remove test codes:**
   ```typescript
   // DELETE THESE IN PRODUCTION:
   'GENESIS-TEST-0001',
   'GENESIS-DEMO-0001',
   ```

3. **Deploy to Cloudflare:**
   ```powershell
   cd y3k-markets-web
   npm run build
   npx wrangler pages deploy out --project-name=y3kmarkets
   ```

4. **Test the portal:**
   - Visit https://y3kmarkets.com/friends-family
   - Try entering a test code (before window opens)
   - Verify disclaimers display correctly

## 6. Monitoring Access

**Check Portal Status:**
```powershell
curl https://y3kmarkets.com/api/friends-family/validate
```

Returns:
```json
{
  "genesisCompleteTime": "2026-01-16T20:00:00-05:00",
  "accessWindowEnd": "2026-01-17T20:00:00-05:00",
  "isOpen": true/false,
  "currentTime": "2026-01-16T20:15:00-05:00"
}
```

## 7. Post-Genesis Actions

**When Genesis Completes (~8 PM EST):**

1. **Send follow-up email** to all invitees:
   ```
   Subject: Genesis Complete - Your Access is Now Active
   
   The Y3K genesis ceremony has completed successfully!
   
   You can now use your access code to mint your namespace:
   https://y3kmarkets.com/friends-family
   
   Your access expires in 24 hours (8 PM EST tomorrow).
   
   Don't wait - first-come-first-served for best namespaces!
   ```

2. **Monitor minting activity:**
   - Check Stripe dashboard for payments
   - Watch `payments.db` for new orders
   - Monitor `available_namespaces` table

3. **Be available for support:**
   - Some people will have questions
   - Monitor support@y3kdigital.com
   - Respond quickly during 24-hour window

## 8. Common Issues & Solutions

**Issue: "Access code invalid"**
- **Solution:** Check spelling, ensure ALL CAPS, verify code is in validation list

**Issue: "Access window not open yet"**
- **Solution:** Wait for genesis to complete, check current time vs window start

**Issue: "Window has closed"**
- **Solution:** Direct them to public minting page (access expired)

**Issue: "Genesis Founder badge not showing"**
- **Solution:** Verify they came through /friends-family portal with valid code

**Issue: "Payment fails"**
- **Solution:** Check Stripe dashboard, verify payments-api is running, check database connection

## 9. Database Tracking (Optional)

**To track code usage in production:**

Add table to `payments.db`:
```sql
CREATE TABLE ff_access_codes (
    code TEXT PRIMARY KEY,
    tier TEXT NOT NULL,
    assigned_email TEXT,
    used_at TIMESTAMP,
    order_id TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

Then update `validate/route.ts` to record usage.

## 10. Legal Compliance Checklist

✅ **Same pricing** as public (no discounts)  
✅ **Clear disclaimers** on portal page  
✅ **No investment language** in emails  
✅ **Terms & conditions** linked  
✅ **All sales final** stated clearly  
✅ **Risk warnings** prominent  

## Quick Reference

**Portal URL:** https://y3kmarkets.com/friends-family  
**Access Window:** 24 hours after genesis  
**Total Codes:** 100 (10 Founder + 90 Early Supporter)  
**Pricing:** Same as public ($35 - $7,500)  
**Benefit:** Early access + Genesis Founder badge  

**Support Email:** support@y3kdigital.com  
**Pricing Details:** https://y3kmarkets.com/pricing  
**Event Info:** https://y3kmarkets.com/genesis  

---

## Next Steps

1. Generate codes: Visit `/api/friends-family/generate-codes`
2. Assign to people: Fill CSV with emails
3. Send invitations: Use template, personalize
4. Deploy to production: Build + Wrangler deploy
5. Monitor genesis: Watch for completion
6. Send activation email: When window opens
7. Support users: Be available for questions

Good luck with your Genesis Founders program! 🚀
