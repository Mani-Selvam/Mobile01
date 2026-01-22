# Quick Start Guide - Enquiry Database Integration

## 🚀 5-Minute Setup

### Step 1: Database Migration (1 min)

```bash
cd server
npm run db:push
```

If npm script doesn't exist, run:

```bash
npx drizzle-kit push:postgres
```

### Step 2: Update Server IP (1 min)

Edit `src/services/enquiryService.js`:

```javascript
const API_URL = "http://YOUR_ACTUAL_SERVER_IP:5000/api";
```

Get your IP:

-   Windows: Run `ipconfig` in terminal, look for IPv4 Address
-   Mac/Linux: Run `ifconfig`, look for inet

### Step 3: Start Backend (1 min)

```bash
cd server
npm start
```

Should see: `🚀 Server running on http://0.0.0.0:5000`

### Step 4: Start Mobile App (1 min)

```bash
expo start
```

Select Android or iOS

### Step 5: Test (1 min)

1. Login to the app
2. Go to Enquiry screen
3. Click "New Enquiry"
4. Fill form and click "Save"
5. Check list - enquiry appears!
6. Open terminal: `psql your_db_name`
7. Query: `SELECT * FROM enquiries;`
8. Your data is there! ✅

## 📱 Testing Checklist

-   [ ] Database migration ran without errors
-   [ ] Server starts and shows port 5000
-   [ ] Mobile app connects (no network errors)
-   [ ] Create enquiry → appears in list
-   [ ] PostgreSQL shows new record
-   [ ] Delete enquiry → removes from DB
-   [ ] Refresh button works
-   [ ] All fields save correctly

## 🔧 Common Issues & Fixes

### Issue: "Failed to create enquiry"

**Fix:** Check API_URL in enquiryService.js matches your server IP

### Issue: "Cannot connect to database"

**Fix:** Ensure PostgreSQL is running and DATABASE_URL is correct

### Issue: "Unauthorized" error

**Fix:** Make sure you're logged in before using enquiry screen

### Issue: "Network request failed"

**Fix:** Mobile device must be on same WiFi network as server

### Issue: Migration error "table already exists"

**Fix:** Drop and recreate: Already created, just use it!

## 📊 Database Queries

### See all enquiries:

```sql
SELECT * FROM enquiries;
```

### See your enquiries (for user_id = 1):

```sql
SELECT * FROM enquiries WHERE user_id = 1;
```

### See by status:

```sql
SELECT * FROM enquiries WHERE enquiry_status = 'New';
```

### Count total:

```sql
SELECT COUNT(*) FROM enquiries;
```

## 📝 What Gets Saved

When you create an enquiry, these 18 fields are stored:

1. enquiryNumber ← Auto-generated
2. enquiryType ← From dropdown
3. leadSource ← From dropdown
4. customerName ← You enter
5. address ← You enter (optional)
6. mobileNumber ← You enter
7. alternateMobileNumber ← You enter (optional)
8. productName ← You enter
9. productVariant ← You enter (optional)
10. productColor ← You enter (optional)
11. productCost ← You enter
12. paymentMethod ← From dropdown
13. enquiryDate ← Auto-set to today
14. enquiryTakenBy ← Auto-filled from logged-in user
15. remarks ← You enter (optional)
16. followUpRequired ← From dropdown
17. nextFollowUpDate ← You enter if follow-up = Yes
18. enquiryStatus ← From dropdown

Plus auto-tracked:

-   `id` - Auto-increment
-   `user_id` - Your user ID
-   `created_at` - When created
-   `updated_at` - When updated

## 🎯 API Endpoints Available

```
POST   /api/enquiries              Create enquiry
GET    /api/enquiries              Get all your enquiries
GET    /api/enquiries/:id          Get one enquiry
PUT    /api/enquiries/:id          Update enquiry
DELETE /api/enquiries/:id          Delete enquiry
GET    /api/enquiries/status/:stat  Get by status
```

All require Bearer token in header.

## 💡 Pro Tips

1. **Bulk Test** - Create multiple enquiries to test filtering/sorting
2. **Check Logs** - Watch browser console and server terminal for errors
3. **Use Postman** - Test API endpoints independently
4. **Verify Token** - AsyncStorage.getItem("token") should have value
5. **Monitor DB** - Keep `SELECT * FROM enquiries;` open in psql to watch data flow

## 🎉 Success Indicators

✅ You'll know it's working when:

-   New enquiry form submits without error
-   Loading spinner appears briefly
-   Success alert shows
-   Enquiry appears in list immediately
-   Data appears in PostgreSQL when you query
-   Delete button removes enquiry from both app and DB
-   Refresh button syncs latest data

## 📞 Support

### Check Logs

-   **Mobile**: Expo dev tools console
-   **Server**: Terminal where npm start runs
-   **Database**: `psql your_db_name`

### Verify Setup

```javascript
// In app console:
AsyncStorage.getItem("token").then((t) => console.log("Token:", t));

// Check API works:
// Use Postman to POST http://YOUR_IP:5000/api/enquiries
// with Authorization: Bearer YOUR_TOKEN
// and body with enquiry data
```

## 🎓 Learning Resources

-   **Drizzle ORM**: Querying and database
-   **Express API**: Backend routes
-   **React Native**: Mobile UI
-   **AsyncStorage**: Local token storage
-   **JWT**: Authentication tokens

## ✨ Next Features to Add

1. **Follow-up Screen** - Link to enquiries
2. **Dashboard** - Analytics & stats
3. **Search** - Find enquiries
4. **Export** - Download as CSV/PDF
5. **Images** - Product photos
6. **Notes** - Attach documents
7. **Reminders** - Push notifications
8. **Sync** - Offline support

---

**You're all set!** 🚀

Run the quick 5-step setup above and your enquiry data will be flowing into your database.
