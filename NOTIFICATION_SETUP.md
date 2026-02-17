# Push Notification Implementation Guide

## Overview

Your app now has a complete push notification system that:

- ✅ Shows local notifications for today's follow-ups automatically
- ✅ Alerts for overdue/missed follow-ups
- ✅ Supports scheduled daily reminders
- ✅ Ready for remote notifications from your backend server

---

## Prerequisites & Setup

### 1. Required Dependencies

The notification system uses Expo's built-in notification service. Ensure you have:

```json
{
    "dependencies": {
        "expo": "^51.0.0",
        "expo-notifications": "^0.27.0",
        "expo-constants": "^16.0.0"
    }
}
```

If not installed, run:

```bash
npx expo install expo-notifications expo-constants
```

### 2. Configure Android Notifications (app.json)

Add this to your `app.json`:

```json
{
    "expo": {
        "plugins": [
            [
                "expo-notifications",
                {
                    "icon": "./assets/notification-icon.png",
                    "color": "#0EA5E9",
                    "defaultChannel": "default"
                }
            ]
        ]
    }
}
```

---

## How It Works

### Auto-Notification on App Start

When the app launches:

1. ✅ Notifications are initialized
2. ✅ Follow-ups are fetched
3. ✅ System checks for today's & overdue follow-ups
4. ✅ Notifications are automatically shown

### Notification Types

#### 1. **Today's Follow-ups** 📋

- Triggers: When there are follow-ups scheduled for today
- Shows: Count of today's follow-ups
- Include: List of people with follow-ups
- Tap: Navigate to "Today" tab in My Follow-ups

#### 2. **Overdue Follow-ups** 🚨

- Triggers: When there are missed follow-ups
- Shows: Count of overdue follow-ups
- Vibration: Stronger vibration pattern for urgency
- Tap: Navigate to "Missed" tab in My Follow-ups

#### 3. **Daily Reminder** ⏰

- Optional: Schedule at specific time each day
- Default: Can set to 9:00 AM
- Repeats: Every day at same time

---

## Usage Guide

### 1. Check & Show Follow-up Notifications

Already implemented! The notifications automatically show when:

- App loads
- Follow-ups are refreshed
- New follow-ups are fetched

### 2. Schedule Daily Reminder (Optional)

Add this in any effect or after login:

```javascript
// Schedule daily reminder at 9:00 AM
useEffect(() => {
    notificationService.scheduleDailyNotification(9, 0);
}, []);
```

### 3. Handle Notification Tap

Already implemented! Tapping notifications:

- Auto-navigates to appropriate follow-up tab
- Sets correct screen view state

### 4. Manual Notification (if needed)

```javascript
// Show custom notification
notificationService.showFollowUpNotification(3, [
    { name: "John Doe", date: "2026-02-11" },
    { name: "Jane Smith", date: "2026-02-11" },
    { name: "Bob Wilson", date: "2026-02-11" },
]);
```

### 5. Cancel Notifications

```javascript
// Cancel all notifications
await notificationService.cancelAllNotifications();

// Cancel only follow-up notifications
await notificationService.cancelFollowUpNotifications();

// Cancel specific notification
await notificationService.cancelNotification(notificationId);
```

---

## Remote Notifications Setup (Backend Integration)

### Get Device Push Token

The system automatically retrieves the device push token on app startup:

```javascript
// This is done automatically in initializeNotificationsAsync()
const pushToken = await notificationService.getDevicePushToken();

// You can also get it manually:
import notificationService from "../services/notificationService";

const token = await notificationService.getDevicePushToken();
console.log("Device Push Token:", token);
```

### Send Remote Notifications from Your Backend

1. **Store the push token on your server**
    - When user logs in, send the device token to your backend
    - Save it in the User model/database

2. **Send notifications from backend**

Example (Node.js with axios):

```javascript
// In your backend API
const axios = require("axios");

async function sendFollowUpNotification(pushToken, followUpData) {
    try {
        await axios.post("https://exp.host/--/api/v2/push/send", {
            to: pushToken,
            sound: "default",
            title: "📋 Follow-up Reminder",
            body: `You have ${followUpData.count} follow-ups today`,
            data: {
                followUpList: JSON.stringify(followUpData),
                timestamp: new Date().toISOString(),
            },
        });

        console.log("Notification sent successfully");
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
}
```

3. **Update your API to store push tokens**

```javascript
// In your backend API route
app.post(
    "/api/auth/register-push-token",
    authenticateUser,
    async (req, res) => {
        const { pushToken } = req.body;
        const userId = req.user.id;

        // Update user with push token
        await User.updateOne(
            { _id: userId },
            { $set: { pushToken, lastTokenUpdate: new Date() } },
        );

        res.json({ success: true, message: "Push token registered" });
    },
);
```

---

## Currently Implemented Features

✅ **Automatic Notifications:**

- On app startup, automatically check today's follow-ups
- Show notification if follow-ups exist
- Show urgent notification if overdue items exist
- Smart icons & colors based on notification type

✅ **Notification Listeners:**

- Tap notification → Navigate to correct tab
- Foreground notifications displayed
- Background notification handling

✅ **Android & iOS Support:**

- Android: High-priority channel with vibration
- iOS: Sound and badge support
- Cross-platform notification buttons

✅ **Customizable:**

- Change notification title, body, icons
- Adjust vibration patterns
- Custom colors & badges

---

## Next Steps & Customization

### 1. Connect to Backend

Uncomment in `initializeNotificationsAsync()`:

```javascript
// Send push token to backend
const pushToken = await notificationService.getDevicePushToken();
if (pushToken) {
    await api.registerPushToken(pushToken);
}
```

### 2. Add to App.js for Global Setup

```javascript
import notificationService from "./src/services/notificationService";

useEffect(() => {
    notificationService.initializeNotifications();
}, []);
```

### 3. Customize Notification Channel Colors

Edit `notificationService.js` - change colors in:

```javascript
await Notifications.setNotificationChannelAsync("followups", {
    lightColor: "#0EA5E9", // Change this to your brand color
});
```

### 4. Add Smart Scheduling

Send daily reminders at different times for different users:

```javascript
// Morning reminder: 9:00 AM
notificationService.scheduleDailyNotification(9, 0);

// Noon reminder: 12:00 PM
notificationService.scheduleDailyNotification(12, 0);

// Evening reminder: 5:00 PM
notificationService.scheduleDailyNotification(17, 0);
```

---

## File Structure

```
src/
├── services/
│   ├── notificationService.js      ← Notification logic
│   ├── followupService.js
│   ├── enquiryService.js
│   └── ...
├── screens/
│   └── FollowUpScreen.js          ← Updated with notifications
└── ...
```

---

## Testing the Notifications

### Test Local Notifications:

1. Open the app
2. Check if notification appears for today's follow-ups
3. Tap notification and verify navigation works

### Test Remote Notifications (when backend ready):

1. Send test push from your backend
2. App should receive and display notification
3. Tap to verify navigation

### Debugging:

Check console logs:

```
console.log("Push token:", token.data)
console.log("Notification shown: X follow-ups today")
console.log("Notification tapped by user")
```

---

## Troubleshooting

| Issue                     | Solution                                |
| ------------------------- | --------------------------------------- |
| Notifications not showing | Check permissions granted in Settings   |
| No push token             | Verify `projectId` in app.json          |
| Notifications not tapping | Check notification listeners are set up |
| Android permission errors | Rebuild app: `expo prebuild`            |

---

## Security Notes

- Push tokens are unique per device
- Store tokens securely on backend
- Validate all notification requests on backend
- Never hardcode push tokens in frontend code

---

## Future Enhancements

- [ ] Backend remote notification system
- [ ] User notification preferences
- [ ] Notification scheduling rules
- [ ] Analytics on notification interactions
- [ ] Dynamic notification templates

---

Happy notifications! 🎉
