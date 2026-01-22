# Enquiry Management - Database Integration Guide

## Overview

All enquiry form data is now stored in your PostgreSQL database with complete CRUD operations, authentication, and real-time syncing with the mobile app.

## Database Setup

### 1. Schema Created

The `enquiries` table has been created with the following fields:

```sql
- id (Primary Key)
- enquiryNumber (Unique)
- userId (Foreign Key to users)
- enquiryType (Product/Service/General Inquiry)
- leadSource (Walk-in, Phone, Email, Website, Social Media, Referral)
- customerName (Required)
- address
- mobileNumber (Required)
- alternateMobileNumber
- productName (Required)
- productVariant
- productColor
- productCost (Required - Lead Value)
- paymentMethod (Cash, Credit, EMI, Online)
- enquiryDate
- enquiryTakenBy (Logged-in User)
- remarks/notes
- followUpRequired (Yes/No)
- nextFollowUpDate
- enquiryStatus (New, Interested, Not Interested, Converted)
- createdAt
- updatedAt
```

### 2. Database Migration

To apply the new schema, run the Drizzle migration:

```bash
cd server
npm run db:push
# or
npx drizzle-kit push:postgres
```

## API Endpoints

### Base URL

```
http://YOUR_SERVER_IP:5000/api
```

### Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer {JWT_TOKEN}
```

### Endpoints

#### 1. Create Enquiry

**POST** `/enquiries`

Request Body:

```json
{
    "enquiryNumber": "ENQ123456",
    "enquiryType": "Product Inquiry",
    "leadSource": "Walk-in",
    "customerName": "John Doe",
    "address": "123 Main St",
    "mobileNumber": "9876543210",
    "alternateMobileNumber": "9876543211",
    "productName": "Laptop",
    "productVariant": "Pro Max",
    "productColor": "Silver",
    "productCost": "50000",
    "paymentMethod": "EMI",
    "enquiryDate": "2025-01-20",
    "enquiryTakenBy": "Agent Name",
    "remarks": "Customer interested in EMI options",
    "followUpRequired": "Yes",
    "nextFollowUpDate": "2025-01-25",
    "enquiryStatus": "Interested"
}
```

Response:

```json
{
  "message": "Enquiry created successfully",
  "enquiry": {
    "id": 1,
    "enquiryNumber": "ENQ123456",
    "userId": 1,
    ...
  }
}
```

#### 2. Get All Enquiries (for logged-in user)

**GET** `/enquiries`

Response:

```json
{
  "message": "Enquiries retrieved successfully",
  "enquiries": [...],
  "total": 5
}
```

#### 3. Get Single Enquiry

**GET** `/enquiries/:id`

Parameters:

-   `id`: Enquiry ID

#### 4. Update Enquiry

**PUT** `/enquiries/:id`

Request Body: Same as Create Enquiry

#### 5. Delete Enquiry

**DELETE** `/enquiries/:id`

#### 6. Get Enquiries by Status

**GET** `/enquiries/status/:status`

Parameters:

-   `status`: "New" | "Interested" | "Not Interested" | "Converted"

## Mobile App Integration

### Configuration

Update the API URL in `src/services/enquiryService.js`:

```javascript
const API_URL = "http://YOUR_SERVER_IP:5000/api"; // Change to your server IP
```

### Features Implemented

1. **Create Enquiry**

    - Validates required fields (Customer Name, Mobile, Product Name, Cost)
    - Auto-generates Enquiry Number
    - Auto-fills Enquiry Date (today)
    - Auto-fills Enquiry Taken By (logged-in user)
    - Saves to database

2. **View Enquiries**

    - Fetches all enquiries from database on app load
    - Refresh button to manually sync
    - Shows loading state
    - Displays enquiry count

3. **View Details**

    - Modal view with all enquiry details
    - Formatted display

4. **Delete Enquiry**

    - Confirmation dialog
    - Removes from database and UI

5. **Real-time Status**
    - Color-coded status indicators
    - New (Blue), Interested (Yellow), Converted (Green), Not Interested (Red)

## Functions Available

### In `enquiryService.js`:

```javascript
// Create new enquiry
createEnquiry(enquiryData);

// Get all enquiries
getAllEnquiries();

// Get single enquiry
getEnquiryById(id);

// Update enquiry
updateEnquiry(id, enquiryData);

// Delete enquiry
deleteEnquiry(id);

// Get enquiries by status
getEnquiriesByStatus(status);
```

## Usage Example

```javascript
import {
    createEnquiry,
    getAllEnquiries,
    deleteEnquiry,
} from "../services/enquiryService";

// Create
const response = await createEnquiry({
    enquiryNumber: "ENQ123456",
    customerName: "John Doe",
    // ... other fields
});

// Get All
const { enquiries } = await getAllEnquiries();

// Delete
await deleteEnquiry(enquiryId);
```

## Security Features

1. **JWT Authentication** - All endpoints protected
2. **User Isolation** - Users only see their own enquiries
3. **Input Validation** - Required fields validated
4. **Authorization Checks** - Users can only modify their own enquiries

## Error Handling

All errors are handled with appropriate HTTP status codes:

-   `400` - Bad Request (Validation Error)
-   `401` - Unauthorized (No/Invalid Token)
-   `403` - Forbidden (Not Owner of Enquiry)
-   `404` - Not Found (Enquiry Not Found)
-   `500` - Server Error

## Next Steps

1. **Follow-up Management**

    - Create follow-ups linked to enquiries
    - Track follow-up dates and outcomes

2. **Analytics**

    - Enquiry conversion rates
    - Lead source performance
    - Agent performance metrics

3. **Notifications**

    - Follow-up reminders
    - Status change alerts

4. **Advanced Filtering**
    - Filter by date range
    - Filter by product
    - Filter by lead source

## Troubleshooting

### Connection Issues

-   Ensure server is running: `npm start` in server directory
-   Check API URL in `enquiryService.js` matches your server IP
-   Verify network connectivity

### Database Issues

-   Check PostgreSQL is running
-   Verify DATABASE_URL in .env file
-   Run migration: `npm run db:push`

### Authentication Issues

-   Ensure user is logged in
-   Check token is stored in AsyncStorage
-   Verify JWT_SECRET in .env file

## Database Backup

To backup your enquiries data:

```bash
pg_dump your_database_name > enquiries_backup.sql
```

To restore:

```bash
psql your_database_name < enquiries_backup.sql
```
