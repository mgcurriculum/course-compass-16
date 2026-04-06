

# Remove Shortlisted Courses Page

## Summary
Delete the Shortlisted page entirely and remove all references to it from navigation and routing.

## Changes

### 1. Delete `src/pages/Shortlisted.tsx`

### 2. `src/components/AppSidebar.tsx`
- Remove the `{ title: 'Shortlisted', url: '/shortlisted', icon: BookmarkCheck }` entry from `navItems`
- Remove unused `BookmarkCheck` import

### 3. `src/App.tsx`
- Remove `import Shortlisted` and its `<Route path="/shortlisted" ... />` line

### Files
- **Delete**: `src/pages/Shortlisted.tsx`
- **Modify**: `src/components/AppSidebar.tsx`, `src/App.tsx`

