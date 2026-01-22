# Follow-up System - Visual Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENQUIRY MANAGEMENT SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐                  ┌──────────────────┐   │
│  │ ENQUIRY SCREEN   │                  │ FOLLOW-UP SYSTEM │   │
│  ├──────────────────┤                  ├──────────────────┤   │
│  │ • Save Enquiry   │──────┬──────────▶│ • Add Follow-up  │   │
│  │ • Edit Enquiry   │      │           │ • View History   │   │
│  │ • Delete Enquiry │      │           │ • Mark Done      │   │
│  │ • View List      │      │           │ • Delete FU      │   │
│  │ • View Detail    │      │           │ • Auto Status    │   │
│  └──────────────────┘      │           └──────────────────┘   │
│                            │                                   │
│                   ┌────────▼─────────┐                        │
│                   │  AUTO POPUP      │                        │
│                   │ "Add Follow-up?" │                        │
│                   └──────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Flow Diagram

```
USER ACTION
    │
    ├──────────────────────────────────────┐
    │                                      │
    ▼                                      ▼
┌─────────────────┐            ┌──────────────────┐
│ SAVE ENQUIRY    │            │ ADD FOLLOW-UP    │
└────────┬────────┘            └────────┬─────────┘
         │                               │
         ├─ Save to enquiries[]  ├─ Save to followUps[]
         ├─ Set status = "NEW"   ├─ Update enquiry
         └─ Show popup           └─ Update status
                                      ├─ "In Progress" (if new FU)
                                      ├─ "Interested" (if marked done)
                                      ├─ "Converted" (if marked done)
                                      └─ "Closed" (if not interested)
         │
         ▼
    UI UPDATES
    └─ List refreshes
    └─ Detail modal closes
    └─ Popup appears / Form opens
    └─ Status badge updates
    └─ Follow-up history updates
```

---

## 📱 Modal Hierarchy

```
┌─────────────────────────────────────────────────┐
│           MAIN ENQUIRY SCREEN                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  • Enquiry List                                 │
│  • [New Enquiry] Button                         │
│  • Add/Edit Form (Optional)                     │
│  • Recent Enquiry Card                          │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ MODAL 1: FOLLOW-UP POPUP                │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📅 Schedule Next Follow-up?             │   │
│  │                                         │   │
│  │ [✅ Yes] [❌ Not Now]                    │   │
│  │                                         │   │
│  │ ┌───────────────────────────────────┐   │   │
│  │ │MODAL 2: FOLLOW-UP FORM            │   │   │
│  │ ├───────────────────────────────────┤   │   │
│  │ │ 📋 Schedule Follow-up             │   │   │
│  │ │                                   │   │   │
│  │ │ • Date* [________]                │   │   │
│  │ │ • Time [________]                 │   │   │
│  │ │ • Type [Call ▼]                   │   │   │
│  │ │ • Remarks* [________]             │   │   │
│  │ │ • Next Action [Interested ▼]      │   │   │
│  │ │ • Next FU Required? [Yes ▼]       │   │   │
│  │ │ • Next FU Date [________]         │   │   │
│  │ │                                   │   │   │
│  │ │ [Save] [Close]                    │   │   │
│  │ └───────────────────────────────────┘   │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ MODAL 3: ENQUIRY DETAIL                 │   │
│  ├─────────────────────────────────────────┤   │
│  │ • Customer Info                         │   │
│  │ • Product Details                       │   │
│  │ • Enquiry Status                        │   │
│  │                                         │   │
│  │ 📅 FOLLOW-UP HISTORY                    │   │
│  │ ┌─────────────────────────────────────┐ │   │
│  │ │ 📞 2024-01-22 • 14:30               │ │   │
│  │ │ Call                                │ │   │
│  │ │ 💬 Customer interested...           │ │   │
│  │ │ Next: Interested                    │ │   │
│  │ │ [🟡 Pending] [✓] [🗑️]               │ │   │
│  │ └─────────────────────────────────────┘ │   │
│  │ [➕ Add Follow-up]                      │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Function Call Flow

```
┌─────────────────────────────────────────────┐
│ User clicks "Save" Enquiry                  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │ saveEnquiry()    │
         └────────┬─────────┘
                  │
         ┌────────┴─────────┐
         │                  │
         ▼                  ▼
    [Validation]       [API Call]
         │                  │
         ├─ Validate   ├─ createEnquiry()
         │             ├─ Save to DB
         │             └─ Return response
         │
         └──────────────┬──────────────
                        │
                        ▼
              ┌─────────────────────┐
              │ setEnquiries([...]) │
              │ setLastSavedEnquiry │
              │ setShowFollowUpPopup│
              └────────────┬────────┘
                           │
                           ▼
                  🎉 POPUP APPEARS
                           │
                  ┌────────┴────────┐
                  │                 │
              [YES]             [NOT NOW]
                  │                 │
                  ▼                 ▼
         ┌──────────────────┐    Reset
         │ setShowFollowUp  │
         │ Form = true      │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Follow-up Form   │
         │ Opens            │
         └─────────┬────────┘
                   │
          User fills and clicks Save
                   │
                   ▼
          ┌─────────────────────┐
          │ addFollowUp()       │
          └────────┬────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
    [Validation]      [Create FU]
         │                    │
    ├─ Check date     ├─ New followUp{}
    └─ Check remarks  ├─ setFollowUps([...])
                      ├─ Update enquiry status
                      │  to "In Progress"
                      └─ setEnquiries([...])
                            │
                            ▼
                   📈 STATUS AUTO-UPDATED!
```

---

## 💾 Data Structure Hierarchy

```
ENQUIRIES
├─ id
├─ enquiryNumber
├─ customerName
├─ mobileNumber
├─ productName
├─ productCost
├─ enquiryStatus: "New" → "In Progress" → "Interested"/"Converted"/"Closed"
├─ enquiryDate
├─ remarks
└─ ... other fields

FOLLOW-UPS
├─ id
├─ enquiryId (linked to ENQUIRIES)
├─ date
├─ time
├─ type: "Call" | "WhatsApp" | "Visit" | "Demo" | "Discussion"
├─ remarks
├─ nextAction: "Interested" | "Need Time" | "Not Interested" | "Converted"
├─ nextFollowUpRequired: "Yes" | "No"
├─ nextFollowUpDate
├─ status: "Pending" | "Completed"
└─ createdAt
```

---

## 🎨 Component Tree

```
EnquiryScreen (Main Component)
│
├─ LinearGradient (Background)
│  │
│  └─ ScrollView
│     │
│     ├─ Header Section
│     │  ├─ Title
│     │  └─ Subtitle
│     │
│     ├─ Button Section
│     │  └─ [New Enquiry] Button
│     │
│     ├─ Form Section (Conditional)
│     │  ├─ Input Fields
│     │  └─ Dropdowns
│     │
│     ├─ Recent Card Section
│     │
│     ├─ List Section
│     │  └─ FlatList
│     │     └─ renderEnquiry() → Enquiry Cards
│     │
│     ├─ Modal: Enquiry Detail
│     │  ├─ ScrollView
│     │  ├─ Enquiry Details
│     │  ├─ Follow-up Management Section
│     │  │  ├─ [Add Follow-up] Button
│     │  │  └─ Follow-up Form (Conditional)
│     │  │     ├─ Date Field
│     │  │     ├─ Time Field
│     │  │     ├─ Type Dropdown
│     │  │     ├─ Remarks Field
│     │  │     ├─ Next Action Dropdown
│     │  │     ├─ Next FU Required Dropdown
│     │  │     ├─ Next FU Date Field (Conditional)
│     │  │     └─ Save/Cancel Buttons
│     │  │
│     │  └─ Follow-up List
│     │     └─ FlatList
│     │        └─ renderFollowUp() → Follow-up Cards
│     │
│     ├─ Modal: Follow-up Popup
│     │  ├─ Popup Title
│     │  ├─ [Yes] Button
│     │  └─ [No] Button
│     │
│     └─ Modal: Follow-up Form
│        ├─ Close Button
│        ├─ Form Header
│        ├─ Form Fields (Same as above)
│        └─ Action Buttons
│
└─ Styles (60+ style objects)
   ├─ Container styles
   ├─ Typography styles
   ├─ Button styles
   ├─ Input styles
   ├─ Modal styles
   ├─ Card styles
   └─ Follow-up specific styles
```

---

## 🔄 State Management Map

```
┌─────────────────────────────────────────────┐
│          ENQUIRY SCREEN STATE               │
├─────────────────────────────────────────────┤
│                                             │
│ 📋 DATA STATES                              │
│ • enquiries [] - All enquiries              │
│ • followUps [] - All follow-ups             │
│ • selectedEnquiry {} - Current detail       │
│ • lastSavedEnquiry {} - Just saved          │
│                                             │
│ 📝 FORM STATES                              │
│ • newEnquiry {} - Enquiry form data         │
│ • newFollowUp {} - Follow-up form data      │
│ • editingEnquiry {} - Being edited          │
│                                             │
│ 🎬 UI STATES                                │
│ • showForm - Add enquiry form               │
│ • showEditForm - Edit enquiry form          │
│ • showFollowUpPopup - Popup modal           │
│ • showFollowUpForm - Form modal             │
│ • dropdownOpen {} - Dropdown states         │
│                                             │
│ ⏳ LOADING STATES                            │
│ • loading - API call loading                │
│ • loadingEnquiries - Fetch loading          │
│                                             │
│ 👤 USER STATES                              │
│ • loggedInUser - Current user               │
│ • isLoggedIn - Auth state (from context)    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Event Flow Chart

```
USER INTERACTION          STATE UPDATE         UI CHANGE
─────────────────         ────────────         ─────────

Click Save Enquiry
                    →     saveEnquiry()     →  Form closed
                    →     setEnquiries()   →  Popup appears
                    →     setFollowUpPopup →  Status = "New"

Click "Yes" (Popup)
                    →     setShowFollowUp   →  Popup closes
                    →     Form = true       →  Form opens

Fill Follow-up Form
                    →     setNewFollowUp()  →  Form updates

Click Save Follow-up
                    →     addFollowUp()     →  Follow-up saved
                    →     setFollowUps()    →  Form closes
                    →     Update enquiry   →  Status → Progress
                    →     setEnquiries()    →  List refreshes

Open Enquiry Detail
                    →     setSelectedEnquiry→  Detail modal opens
                    →                          Follow-ups visible

Click "Mark Done"
                    →     markFollowUp()    →  Status badge updates
                    →     Complete FU       →  Enquiry status changes
                    →     setEnquiries()    →  List refreshes

Click Delete FU
                    →     Confirmation      →  Dialog appears

Confirm Delete
                    →     deleteFollowUp()  →  FU removed
                    →     setFollowUps()    →  List refreshes

Click Add FU (Detail)
                    →     setShowFollowUp   →  Form modal opens
                    →     Form = true       →  Inside detail modal
```

---

## 🎨 Styling Hierarchy

```
GLOBAL STYLES
│
├─ Background Gradient: #0f0f23 → #1a1a2e → #16213e
│
├─ CONTAINER STYLES
│  ├─ container: Main flex container
│  ├─ scrollContainer: With padding
│  └─ modalContainer: For modals
│
├─ TYPOGRAPHY STYLES
│  ├─ title: 28px, bold, white
│  ├─ subtitle: 14px, gray
│  ├─ label: 14px, bold, white
│  └─ detailValue: 15px, medium, white
│
├─ BUTTON STYLES
│  ├─ buttonGradient: #667eea → #764ba2
│  ├─ button: 56px height, row, centered
│  └─ actionButton: Similar with colors
│
├─ INPUT STYLES
│  ├─ input: 56px height, with icon space
│  ├─ inputIcon: Positioned absolutely
│  └─ multilineInput: 100px height
│
├─ FOLLOW-UP STYLES (NEW)
│  ├─ followUpItem: Card with gradient
│  ├─ followUpHeader: With icon & content
│  ├─ statusBadge: Color-coded
│  ├─ followUpActionButton: Green with icon
│  └─ followUpDeleteButton: Red button
│
├─ MODAL STYLES (NEW)
│  ├─ popupOverlay: Dark background
│  ├─ popupCard: Centered with gradient
│  └─ popupButton: Large touch target
│
└─ ANIMATION STYLES
   └─ Animated.View: FadeInUp with delay
```

---

## 📊 Status Update Decision Tree

```
                    Follow-up Completed?
                           │
                           ▼
                    Check nextAction
                           │
                ┌──────────┼──────────┐
                │          │          │
                ▼          ▼          ▼
           Interested  Converted  Not Interested  Need Time
                │          │          │              │
                ▼          ▼          ▼              ▼
          Status:     Status:    Status:        Status:
         INTERESTED  CONVERTED  CLOSED       IN PROGRESS
```

---

## 🚀 Performance Optimization

```
OPTIMIZATION STRATEGIES
│
├─ STATE MANAGEMENT
│  ├─ Separate state for UI (showForm, showModal)
│  ├─ Separate state for data (enquiries, followUps)
│  └─ Efficient filtering with getFollowUpsForEnquiry()
│
├─ RENDERING
│  ├─ FlatList for scrollable lists (not map)
│  ├─ keyExtractor for proper key handling
│  ├─ scrollEnabled={false} for nested scrolls
│  └─ Conditional rendering for modals
│
├─ ANIMATIONS
│  ├─ Animated.View with FadeInUp
│  ├─ Staggered delays for effect
│  └─ GPU-accelerated transforms
│
└─ CODE EFFICIENCY
   ├─ Reusable DropdownComponent
   ├─ Reusable renderFollowUp component
   └─ Utility functions (resetForm, resetFollowUpForm)
```

---

## ✨ Feature Matrix

```
FEATURE                  IMPLEMENTED    TESTED    DOCUMENTED
───────────────────────────────────────────────────────────
Auto Popup               ✅             ✅        ✅
Follow-up Form           ✅             ✅        ✅
Auto Status Update       ✅             ✅        ✅
Follow-up History        ✅             ✅        ✅
Mark Done                ✅             ✅        ✅
Delete Follow-up         ✅             ✅        ✅
Form Validation          ✅             ✅        ✅
Dropdown Selections      ✅             ✅        ✅
Rich Metadata Display    ✅             ✅        ✅
Status Badges            ✅             ✅        ✅
Animations               ✅             ✅        ✅
Responsive Design        ✅             ✅        ✅
Professional UI          ✅             ✅        ✅
Documentation            ✅             N/A       ✅
```

---

This architectural overview shows how all components, states, functions, and styles work together to create a cohesive follow-up management system!
