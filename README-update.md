# Certificate Management Application

## Required Dependencies

To run this application, you'll need to update the package.json with the following additional dependencies that are required for the AddCertificate component:

```json
"@mui/icons-material": "^6.4.7",
"@mui/x-date-pickers": "^7.0.0",
"date-fns": "^3.0.0"
```

Please run `npm install` after updating the package.json file to install these new dependencies.

## Component Features

The AddCertificate component that was created includes the following features:

1. Form fields corresponding to the PostgreSQL table structure
2. Material-UI date pickers for date fields
3. Number inputs for integer values
4. Text fields for text values
5. Close button in the top-right corner
6. Confirmation popup when trying to close with unsaved changes
7. Form data collection on submit
8. Visual styling following Material-UI guidelines

## Integration

The component has been integrated into the Tabs.tsx file, replacing the "ADD CERTIFICATE" placeholder text.

# Project Dropdown Implementation

## Overview
This update replaces the plain text input for project selection (`Prakalpa_name`) with a searchable dropdown component that fetches project data from the backend and allows users to search and select projects.

## Key Changes

### 1. Type Updates (`src/types.ts`)
- Added `prakalpa_id: number | null` field to `FormState` interface
- Added `Project` interface with `Prakalpa_id` and `Prakalpa_name` fields

### 2. API Integration (`src/api/certificateApi.ts`)
- Added `fetchProjects()` function to fetch all projects from `/admin/getProjects` endpoint
- Function returns array of `Project` objects with ID and name

### 3. Component Updates (`src/Components/AddCertificate.tsx`)

#### New State Variables:
- `projects`: Array of all available projects
- `filteredProjects`: Filtered projects based on search text
- `showProjectSuggestions`: Controls dropdown visibility
- `selectedProjectIndex`: Keyboard navigation index
- `projectSearchText`: Current search input text
- `isLoadingProjects`: Loading state for API calls

#### New Functions:
- `handleProjectSearchChange()`: Filters projects as user types
- `handleProjectSelection()`: Updates form data when project is selected
- `handleProjectKeyDown()`: Keyboard navigation (arrow keys, enter, escape)

#### UI Changes:
- Replaced `TextField` with searchable dropdown
- Added loading indicator while fetching projects
- Added empty state message when no projects found
- Keyboard navigation support (arrow keys, enter, escape)

### 4. Form State Management
- Form now stores both `prakalpa_id` (for backend) and `prakalpa_nav` (for display)
- Backward compatibility maintained with existing form submission logic
- Project selection updates both ID and name fields

## Backend Requirements

The backend needs to provide the following API endpoint:

```
GET /admin/getProjects
Headers: Authorization: Bearer <token>
Response: {
  "projects": [
    {
      "Prakalpa_id": 1,
      "Prakalpa_name": "Project Name 1"
    },
    {
      "Prakalpa_id": 2,
      "Prakalpa_name": "Project Name 2"
    }
  ]
}
```

## Database Schema

The backend should query the `mst_tblprakalpa_names` table:

```sql
SELECT Prakalpa_id, Prakalpa_name 
FROM mst_tblprakalpa_names 
WHERE Isactive = 1 
ORDER BY Prakalpa_name
```

## User Experience

1. **On Form Open**: Projects are automatically fetched from the backend
2. **Search**: Users can type to filter projects by name
3. **Selection**: Click or use keyboard navigation to select a project
4. **Display**: Selected project name is shown in the input field
5. **Submission**: Both project ID and name are sent to the backend

## Error Handling

- Loading state shown while fetching projects
- Error message displayed if API call fails
- Empty state shown when no projects match search
- Graceful fallback if no projects are available

## Testing

To test the implementation:

1. Start the development server: `npm run dev`
2. Open the "Add New Certificate" or "Edit Certificate" form
3. Verify that projects are loaded in the dropdown
4. Test search functionality by typing project names
5. Test keyboard navigation (arrow keys, enter, escape)
6. Verify that selected project data is correctly stored in form state