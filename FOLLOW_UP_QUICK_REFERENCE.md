# Follow-up System - Quick Reference

## 🎯 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENQUIRY MANAGEMENT FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1️⃣  SAVE ENQUIRY
   ┌──────────────────────────────┐
   │ Fill Enquiry Form            │
   │ • Customer Name              │
   │ • Mobile Number              │
   │ • Product Name               │
   │ • Product Cost               │
   │ • Other Details              │
   └──────────────┬───────────────┘
                  │
                  │ Click "Save"
                  ▼
   ┌──────────────────────────────┐
   │ ✅ ENQUIRY SAVED             │
   │ Status: NEW                  │
   └──────────────┬───────────────┘
                  │
                  │
2️⃣  FOLLOW-UP POPUP APPEARS
   ┌──────────────────────────────┐
   │ 📅 Schedule Next Follow-up?   │
   │ Enquiry saved successfully!  │
   │                              │
   │ [✅ YES]   [❌ NOT NOW]       │
   └──┬──────────────────────────┬─┘
      │                          │
      │ YES                      │ NOT NOW
      ▼                          ▼
   3️⃣  FOLLOW-UP FORM    Enquiry Remains
   Opens                   Status: NEW
      │
      │
3️⃣  FILL FOLLOW-UP FORM
   ┌────────────────────────────────────┐
   │ 📋 Schedule Follow-up              │
   │                                    │
   │ Follow-up Date*: 2024-01-25        │
   │ Follow-up Time: 14:30              │
   │ Type: [Call ▼]                     │
   │ Remarks*: Customer interested...   │
   │ Next Action: [Interested ▼]        │
   │ Next FU Required?: [Yes ▼]         │
   │ Next FU Date: 2024-01-28           │
   │                                    │
   │ [✅ Save] [❌ Close]                │
   └────────────┬─────────────────────┘
                │
                │ Click "Save"
                ▼
   ┌─────────────────────────────┐
   │ ✅ FOLLOW-UP SAVED          │
   │ Status: IN PROGRESS         │
   │ (Auto-updated)              │
   └─────────────────────────────┘
      │
      │
4️⃣  VIEW ENQUIRY DETAIL
   ┌──────────────────────────────────┐
   │ ENQUIRY DETAILS                  │
   │ • Enquiry Number: ENQ123456      │
   │ • Customer: John Doe             │
   │ • Mobile: 9876543210             │
   │ • Product: XYZ                   │
   │ • Cost: ₹50,000                  │
   │ • Status: IN PROGRESS            │
   │                                  │
   │ 📅 FOLLOW-UP HISTORY             │
   │                                  │
   │ ┌──────────────────────────────┐ │
   │ │ 📞 2024-01-25 • 14:30        │ │
   │ │ Call                         │ │
   │ │                              │ │
   │ │ 💬 Customer interested,      │ │
   │ │    asked for demo            │ │
   │ │                              │ │
   │ │ Next: Interested             │ │
   │ │                              │ │
   │ │ [🟡 Pending]                 │ │
   │ │ [✓ Mark Done] [🗑️ Delete]    │ │
   │ └──────────────────────────────┘ │
   │                                  │
   │ [➕ Add Follow-up]               │
   └──────────────────────────────────┘
      │
      │
5️⃣  MARK FOLLOW-UP DONE
   Click "Mark Done" on pending FU
      │
      ▼
   ┌──────────────────────────────┐
   │ Status Auto-Updated!         │
   │                              │
   │ Based on "Next Action":      │
   │ • Interested → INTERESTED    │
   │ • Need Time → IN PROGRESS    │
   │ • Not Interested → CLOSED    │
   │ • Converted → CONVERTED      │
   └──────────────────────────────┘
```

---

## 📊 Status Flow Chart

```
                    Enquiry Created
                         │
                         ▼
                    Status: NEW
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
   Add Follow-up              No Follow-up Added
        │                                 │
        ▼                                 ▼
   Status: IN PROGRESS         Stays: NEW
        │                      (User can add later)
        │
        ├─→ Mark Done: "Interested" → Status: INTERESTED
        ├─→ Mark Done: "Need Time" → Status: IN PROGRESS
        ├─→ Mark Done: "Not Interested" → Status: CLOSED
        └─→ Mark Done: "Converted" → Status: CONVERTED
```

---

## 🎨 Follow-up Card Display

```
┌─────────────────────────────────────────────┐
│ 📞 2024-01-22 • 14:30                       │
│ Call                                        │
│                                             │
│ 💬 Customer interested, asked for price     │
│ analysis. Agreed for demo on 25th Jan.      │
│                                             │
│ Next Action: Interested                     │
│                                             │
│ [🟡 Pending] [✓ Mark Done] [🗑️ Delete]      │
└─────────────────────────────────────────────┘

Colors & Icons:
🟡 Pending - Orange - Awaiting action
🟢 Completed - Green - Done
📞 Call
💬 WhatsApp
🏠 Visit
🎬 Demo
💭 Discussion
```

---

## 📋 Follow-up Form Layout

```
┌─────────────────────────────────────────┐
│ 📅 Schedule Follow-up                   │
├─────────────────────────────────────────┤
│                                         │
│ Follow-up Date * ________________________│
│ (YYYY-MM-DD format required)            │
│                                         │
│ Follow-up Time _________________________│
│ (HH:MM format optional)                 │
│                                         │
│ Follow-up Type ▼ ________________________│
│ [Call, WhatsApp, Visit, Demo, Discussion]
│                                         │
│ Discussion / Remarks * _________________│
│ _____________________________________  │
│ _____________________________________  │
│                                         │
│ Next Action ▼ __________________________│
│ [Interested, Need Time, Not Interested, │
│  Converted]                             │
│                                         │
│ Next Follow-up Required? ▼ ______________│
│ [Yes / No]                              │
│                                         │
│ IF YES:                                 │
│ Next Follow-up Date ____________________│
│ (YYYY-MM-DD)                            │
│                                         │
│ [✅ Save Follow-up] [❌ Close]           │
└─────────────────────────────────────────┘
```

---

## 🔄 Status Update Logic

| Follow-up Completed | Next Action    | New Enquiry Status |
| ------------------- | -------------- | ------------------ |
| ✓                   | Interested     | INTERESTED         |
| ✓                   | Need Time      | IN PROGRESS        |
| ✓                   | Not Interested | CLOSED             |
| ✓                   | Converted      | CONVERTED          |

---

## 📱 Popup Modal

```
┌───────────────────────────────────┐
│ ┌──────────────────────────────┐  │
│ │         📅                   │  │
│ │  Schedule Next Follow-up?    │  │
│ │  Your enquiry was saved      │  │
│ │  successfully!               │  │
│ │                              │  │
│ │ ┌──────────────────────────┐ │  │
│ │ │ ✅ YES, ADD FOLLOW-UP   │ │  │
│ │ └──────────────────────────┘ │  │
│ │                              │  │
│ │ ┌──────────────────────────┐ │  │
│ │ │ ❌ NOT NOW              │ │  │
│ │ └──────────────────────────┘ │  │
│ └──────────────────────────────┘  │
└───────────────────────────────────┘
```

---

## ✨ Key Features

### ✅ Implemented Features

- [x] Auto popup after saving enquiry
- [x] Flexible follow-up form with all required fields
- [x] Auto status updates based on follow-up completion
- [x] Follow-up history visible in enquiry detail
- [x] Mark follow-ups as completed
- [x] Delete follow-ups with confirmation
- [x] Chain follow-ups (schedule next FU within current FU)
- [x] Rich metadata display (date, time, type, remarks, next action)
- [x] Status badges with color coding
- [x] Validation for required fields

### 🎯 Field Breakdown

**Required Fields:**

- Follow-up Date
- Discussion / Remarks

**Optional Fields:**

- Follow-up Time
- Next Follow-up Date (conditional)

**Dropdown Selections:**

- Follow-up Type (Call, WhatsApp, Visit, Demo, Discussion)
- Next Action (Interested, Need Time, Not Interested, Converted)
- Next Follow-up Required (Yes, No)

---

## 🚀 Quick Tips

1. **Format Dates**: Use YYYY-MM-DD (e.g., 2024-01-22)
2. **Format Times**: Use HH:MM (e.g., 14:30 for 2:30 PM)
3. **Always fill**: Follow-up Date and Remarks
4. **Status auto-updates**: When you mark follow-up as done
5. **Add multiple follow-ups**: Each enquiry can have unlimited follow-ups
6. **View history**: Open enquiry detail to see all follow-ups
7. **Chain follow-ups**: Set "Next Follow-up Required" to "Yes" and add date

---

## 📊 Enquiry Status Values

```
NEW → User just created the enquiry
   ↓
IN PROGRESS → Follow-up added (auto)
   ↓
INTERESTED → Follow-up marked done with "Interested"
   ↓ or ↙
CONVERTED → Follow-up marked done with "Converted"

CLOSED → Follow-up marked done with "Not Interested"
```

---

## 🔔 Next Features (Future)

- [ ] Auto reminders on follow-up date
- [ ] Push notifications
- [ ] Calendar integration
- [ ] WhatsApp integration
- [ ] Email reminders
- [ ] Analytics dashboard
- [ ] Follow-up success rate
- [ ] Export follow-up history

---

## 💡 Examples

### Example 1: New Customer Inquiry

```
Step 1: Save Enquiry
Name: Rajesh Kumar | Mobile: 9876543210 | Product: Solar Panel | Cost: ₹1,50,000
→ Status: NEW

Step 2: Popup appears "Schedule Next Follow-up?"
→ Click "Yes, Add Follow-up"

Step 3: Fill Follow-up
Date: 2024-01-25
Time: 14:30
Type: Call
Remarks: Customer interested, asked about warranty and installation
Next Action: Interested
Next FU Required: Yes
Next FU Date: 2024-01-28

→ Status: IN PROGRESS (auto)

Step 4: On 2024-01-25, Mark Done
→ Status: INTERESTED (auto, based on "Interested")

Step 5: Continue with follow-ups...
```

---

## 📞 Support

For issues or questions:

1. Check FOLLOW_UP_WORKFLOW.md for detailed documentation
2. Verify date format: YYYY-MM-DD
3. Verify time format: HH:MM
4. Ensure required fields are filled
5. Check browser console for error messages
