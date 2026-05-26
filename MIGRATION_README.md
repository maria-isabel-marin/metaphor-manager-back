# Document Migration Guide

## Overview
This migration updates the document schema to use a unified file storage approach with the following changes:

- **New fields**: `gcsPath` (unified file path) and `fileType` (file type: 'pdf' or 'txt')
- **Legacy fields**: `gcsPathPdf` and `gcsPathTxt` are kept for backward compatibility
- **Validation**: Required fields are now properly validated (title, type, language, file)

## Changes Made

### Backend Changes
1. **Schema Updates** (`backend/src/documents/schemas/document.schema.ts`):
   - Added `gcsPath` and `fileType` fields
   - Kept legacy fields for compatibility
   - Made `gcsPath` optional

2. **DTO Updates**:
   - `CreateDocumentDto`: Added `@IsNotEmpty()` validations for required fields
   - `UpdateDocumentDto`: Added `@IsNotEmpty()` validations for required fields

3. **Service Updates** (`backend/src/documents/documents.service.ts`):
   - Updated `create()` method to set `fileType` based on MIME type
   - Updated `update()` method to handle file uploads during updates
   - Updated `findByProject()` and `remove()` to use new unified path approach
   - Added fallback to legacy fields for backward compatibility

4. **Controller Updates** (`backend/src/documents/documents.controller.ts`):
   - Added file validation in `create()` method
   - Added file upload support in `update()` method
   - Added `FileInterceptor` to update endpoint

### Frontend Changes
1. **Type Updates** (`metaphor-manager-front/src/types/document.ts`):
   - Added `gcsPath` and `fileType` fields
   - Updated `fileUrl` to use unified approach
   - Kept legacy fields for compatibility

2. **Modal Updates** (`metaphor-manager-front/src/components/DocumentModal.tsx`):
   - Added form validation for required fields
   - Added file upload support in edit mode
   - Added error display for validation failures
   - Removed notes field (as per requirements)
   - Added visual indicators for required fields

## Migration Steps

### 1. Database Migration
Run the MongoDB migration script to update existing documents:

```bash
# Connect to your MongoDB instance
mongosh

# Run the migration script
load("migration_script.mongo")
```

Or manually run the commands in the migration script:

```javascript
// Update documents with gcsPathPdf
db.documents.updateMany(
  { 
    gcsPathPdf: { $exists: true, $ne: null },
    gcsPath: { $exists: false }
  },
  [
    {
      $set: {
        gcsPath: "$gcsPathPdf",
        fileType: "pdf"
      }
    }
  ]
);

// Update documents with gcsPathTxt
db.documents.updateMany(
  { 
    gcsPathTxt: { $exists: true, $ne: null },
    gcsPath: { $exists: false }
  },
  [
    {
      $set: {
        gcsPath: "$gcsPathTxt",
        fileType: "txt"
      }
    }
  ]
);
```

### 2. Deploy Backend Changes
1. Deploy the updated backend code
2. Restart the backend service
3. Verify that new documents are created with the correct schema

### 3. Deploy Frontend Changes
1. Deploy the updated frontend code
2. Test the document creation and editing functionality
3. Verify that validation works correctly

## Validation Rules

### Creation
- **Required**: title, type, language, file
- **Optional**: description

### Update
- **Required**: title, type, language (if provided)
- **Optional**: description, file (if provided)

## File Type Detection
The system automatically detects file types based on MIME types:
- `application/pdf` → `fileType: "pdf"`
- `text/plain` → `fileType: "txt"`

## Backward Compatibility
The system maintains backward compatibility by:
1. Checking for `gcsPath` first
2. Falling back to `gcsPathPdf` or `gcsPathTxt` if `gcsPath` doesn't exist
3. Keeping legacy fields in the schema

## Testing
After migration, test the following scenarios:
1. Create new documents with PDF and TXT files
2. Edit existing documents (with and without file changes)
3. Verify that existing documents still work
4. Test validation for required fields
5. Verify file uploads work in both create and edit modes 