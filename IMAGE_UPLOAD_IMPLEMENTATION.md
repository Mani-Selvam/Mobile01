# Image Upload Implementation for Enquiry System

## Overview
This document outlines the complete image upload functionality added to the CRM enquiry system, allowing users to upload customer photos when creating or updating enquiries.

## Backend Implementation

### 1. Dependencies Added
- **multer** (v1.4.5-lts.1): Middleware for handling multipart/form-data (file uploads)

### 2. Database Schema Update
**File**: `server/models/Enquiry.js`
- Added `image` field (String type) to store image paths or base64 strings

### 3. Server Configuration
**File**: `server/server.js`
- Increased JSON body size limit to 10MB for base64 images
- Added static file serving for `/uploads` directory
- Configured express.urlencoded for handling form data

### 4. Upload Configuration
**File**: `server/routes/enquiryRoutes.js`

**Multer Configuration**:
- Storage: Disk storage in `server/uploads/` directory
- File naming: `image-{timestamp}-{random}.{ext}`
- File size limit: 5MB
- Allowed formats: jpeg, jpg, png, gif, webp

**API Endpoints Updated**:

#### POST `/api/enquiries`
- Accepts multipart/form-data with `image` field
- Also accepts JSON with base64 `image` string
- Stores file path as `/uploads/{filename}` in database
- Falls back to base64 if no file uploaded

#### PUT `/api/enquiries/:id`
- Same image handling as POST
- Updates existing enquiry with new image if provided

#### GET `/api/enquiries`
- Returns all enquiries including image paths

#### GET `/api/enquiries/:id`
- Returns single enquiry with image path

## Frontend Implementation

### 1. Dependencies
- **expo-image-picker**: Already installed for image selection

### 2. Image Helper Utility
**File**: `src/utils/imageHelper.js`

**Function**: `getImageUrl(imagePath)`
- Converts server paths to full URLs
- Handles base64, file://, http://, https:// URIs
- Constructs full URL for `/uploads/` paths using API_URL

### 3. UI Components Updated

#### AddEnquiryScreen.js
- Added circular image picker in Customer Details section
- Shows camera icon placeholder when no image
- Displays uploaded image in circular preview
- Edit badge icon for changing image
- Stores image URI in form state

#### EnquiryScreen.js
- **Card View**: Shows customer image in circular avatar (replaces initials)
- **Details Modal**: Displays full image at top of modal (200px height)
- Uses `getImageUrl()` helper to construct proper URLs
- Gracefully falls back to initials if no image

### 4. Image Upload Flow

**Current Implementation** (JSON with URI):
```javascript
1. User selects image via expo-image-picker
2. Image URI stored in form.image
3. Submitted as JSON: { image: "file://..." }
4. Server stores URI as-is in database
```

**Future Enhancement** (Actual File Upload):
To upload actual files to server, update `handleSubmit` in AddEnquiryScreen.js:
```javascript
const formData = new FormData();
formData.append('name', form.name);
formData.append('mobile', form.mobile);
// ... other fields
if (form.image) {
    formData.append('image', {
        uri: form.image,
        type: 'image/jpeg',
        name: 'photo.jpg'
    });
}

fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: formData
});
```

## File Structure

```
server/
├── models/
│   └── Enquiry.js (updated with image field)
├── routes/
│   └── enquiryRoutes.js (added multer & image handling)
├── uploads/ (created for storing images)
└── server.js (updated for static serving)

src/
├── screens/
│   ├── AddEnquiryScreen.js (image picker UI)
│   └── EnquiryScreen.js (image display)
└── utils/
    └── imageHelper.js (URL construction)
```

## API Examples

### Create Enquiry with Image (JSON)
```http
POST /api/enquiries
Content-Type: application/json

{
  "name": "John Doe",
  "mobile": "1234567890",
  "product": "Product A",
  "cost": 5000,
  "image": "file:///path/to/image.jpg"
}
```

### Create Enquiry with Image (Multipart)
```http
POST /api/enquiries
Content-Type: multipart/form-data

name=John Doe
mobile=1234567890
product=Product A
cost=5000
image=[binary file data]
```

### Response
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "enqNo": "ENQ-001",
  "name": "John Doe",
  "mobile": "1234567890",
  "product": "Product A",
  "cost": 5000,
  "image": "/uploads/image-1707654321-123456789.jpg",
  "status": "New",
  "createdAt": "2024-02-11T12:00:00.000Z"
}
```

## Image Display URLs

**Server Path**: `/uploads/image-1707654321-123456789.jpg`
**Full URL**: `http://192.168.1.37:5000/uploads/image-1707654321-123456789.jpg`

The `getImageUrl()` helper automatically constructs the full URL.

## Security Considerations

1. **File Size Limit**: 5MB per image
2. **File Type Validation**: Only image formats allowed
3. **Unique Filenames**: Timestamp + random number prevents collisions
4. **Directory Security**: Uploads folder created with proper permissions

## Testing Checklist

- [x] Create enquiry with image (JSON)
- [ ] Create enquiry with image (Multipart)
- [ ] Update enquiry with new image
- [x] Display image in card list
- [x] Display image in details modal
- [x] Handle missing images gracefully
- [ ] Test file size limits
- [ ] Test invalid file types
- [ ] Test on physical device

## Next Steps

1. **Implement FormData Upload**: Update AddEnquiryScreen to use multipart/form-data
2. **Image Compression**: Add image compression before upload
3. **Delete Old Images**: Clean up old images when updating
4. **Cloud Storage**: Consider AWS S3 or Cloudinary for production
5. **Image Optimization**: Add thumbnail generation for list views

## Notes

- Current implementation stores local file URIs in database
- For production, implement actual file upload to server
- Consider CDN for better image delivery
- Add loading states for image uploads
- Implement retry logic for failed uploads
