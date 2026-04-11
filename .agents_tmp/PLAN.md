# 1. OBJECTIVE

Add user authentication to the Power Interruption monitoring dashboard, including a login page, session management, password change functionality, and user profile update capability.

# 2. CONTEXT SUMMARY

This is a Next.js application for monitoring power interruption events in the Balayan, Batangas grid area. The codebase includes:
- **Types** (`types/index.ts`): PowerEvent, EventTimeline, Device interfaces
- **Data** (`data/events.ts`): Static event data and timeline generator
- **Context** (`context/DeviceContext.tsx`): Device and event state management with basic CRUD
- **Components**: StatCards, EventTable, Map, DetailPanel, Sidebar, Header
- **Pages**: Dashboard (/), Devices (/devices), Events (/events), Map (/map), Reports (/reports), Settings (/settings)

The application uses React context for state management and follows a component-based architecture with Tailwind CSS for styling.

## Security Considerations (from security best practices)
- Never store passwords in plain text - use hashing
- Validate and sanitize all user inputs
- Implement secure session management
- Apply principle of least privilege

# 3. APPROACH OVERVIEW

Implement authentication by:
1. Creating an AuthContext for session management
2. Creating a login page with email/password authentication
3. Adding a password change feature with validation
4. Adding a user profile page for updating user details
5. Adding protected routes that require authentication
6. Using localStorage for demo session persistence (with proper password hashing for demo)

# 4. IMPLEMENTATION STEPS

## Step 1: Create AuthContext and Authentication Types
- **Goal**: Set up authentication state management
- **Method**: 
  - Create `types/auth.ts` with User interface and auth types
  - Create `context/AuthContext.tsx` with login, logout, changePassword, updateProfile functions
  - Store session in localStorage for demo purposes
- **Reference**: `types/auth.ts`, `context/AuthContext.tsx`

## Step 2: Create Login Page
- **Goal**: Add login page for user authentication
- **Method**: 
  - Create `app/login/page.tsx` with email and password fields
  - Validate credentials against mock user data
  - Store session on successful login
  - Redirect to dashboard after login
- **Reference**: `app/login/page.tsx`

## Step 3: Add Protected Routes
- **Goal**: Ensure only authenticated users can access dashboard
- **Method**: 
  - Create a Higher-Order Component or wrapper that checks authentication
  - Redirect unauthenticated users to login page
  - Add auth check to layout or individual pages
- **Reference**: `app/layout.tsx`, individual page components

## Step 4: Create Change Password Feature
- **Goal**: Allow users to change their password
- **Method**: 
  - Add change password modal to Settings page
  - Validate current password before allowing change
  - Require new password confirmation
  - Update stored password (hashed)
- **Reference**: `app/settings/page.tsx`

## Step 5: Create User Profile Page
- **Goal**: Allow users to view and update their profile
- **Method**: 
  - Create `app/profile/page.tsx` with user details
  - Allow updating display name and email
  - Show account information (role, last login)
- **Reference**: `app/profile/page.tsx`

## Step 6: Add Logout Functionality
- **Goal**: Allow users to securely logout
- **Method**: 
  - Add logout button to Header component
  - Clear session from localStorage
  - Redirect to login page
- **Reference**: `components/Header.tsx`

# 5. TESTING AND VALIDATION

- **Login Page**: Enter valid credentials - should redirect to dashboard; Enter invalid credentials - should show error message
- **Protected Routes**: Access dashboard without login - should redirect to login page
- **Change Password**: Enter wrong current password - should show error; Enter matching new passwords - should succeed
- **Profile Update**: Change display name or email - should persist after page refresh
- **Logout**: Click logout - should redirect to login page with session cleared

---

# Original Plan (Also to be implemented)

## Step 1: Add Event Search and Filter to EventTable
- **Goal**: Make the search input and filter dropdowns functional
- **Method**: Add searchQuery and filterStatus state to EventTable, implement filtering logic that filters events by ID, location, status, and severity
- **Reference**: `components/EventTable.tsx`

## Step 2: Add Event Creation Function
- **Goal**: Allow creating new power events via UI
- **Method**: 
  - Add `addEvent` function to DeviceContext that creates new PowerEvent with generated ID
  - Add "Add Event" button to Events page with a modal form for event details (location, severity, grid, notes)
- **Reference**: `context/DeviceContext.tsx`, `app/events/page.tsx`

## Step 3: Add Event Status Update
- **Goal**: Enable changing event status (Active → Investigating → Resolved)
- **Method**: 
  - Add `updateEventStatus` function to DeviceContext
  - Add status change buttons to DetailPanel when event is Active or Investigating
- **Reference**: `context/DeviceContext.tsx`, `components/DetailPanel.tsx`

## Step 4: Add Device Editing
- **Goal**: Allow editing existing device details
- **Method**: 
  - Add "Edit" button in device detail modal that switches to edit mode
  - Allow editing name, grid, and status fields
  - Save changes via existing `updateDevice` function
- **Reference**: `app/devices/page.tsx`

## Step 5: Implement Report Generation
- **Goal**: Make the Generate Report form functional
- **Method**: 
  - Add `generateReport` function that creates a report object based on selected type and date range
  - Generate mock summary data (total events, critical count, average duration)
  - Display generated report in a modal or download as JSON
- **Reference**: `app/reports/page.tsx`

## Step 6: Add Settings Persistence
- **Goal**: Persist settings changes across sessions
- **Method**: 
  - Add useEffect to load settings from localStorage on mount
  - Add useEffect to save settings to localStorage on change
  - Store: notifications, emailAlerts, darkMode, autoRefresh, refreshInterval, gridLocation, alertThreshold
- **Reference**: `app/settings/page.tsx`
