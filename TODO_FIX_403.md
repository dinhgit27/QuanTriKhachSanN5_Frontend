# TODO_FIX_403.md - Fix Admin 403 after login

## Plan Steps:
1. [x] Update src/utils/auth.js - Enhance getUserRoles() for multiple claim formats (added multi-key support + console logs)
2. [x] Update src/routes/RoleBasedRoute.jsx - Enhanced debug logs (roles, allowed, isAllowed)
3. [x] Update src/components/RequirePermission.jsx - Added debug logs for permissions check
4. [x] Test: Ready - Run `npm run dev`, login as admin, check browser console for:
   - "Decoded token claims: [...]"
   - "Found roles: [...]"
   - "RoleBasedRoute debug: {...}"
   - "RequirePermission debug: {...}"
   Paste console output if still 403.

5. [x] App.jsx: allowedRoles += "Manager" for admin paths
6. [x] LoginPage.jsx: redirect "Manager" → /admin/users (prevent guest fallback)
7. [x] Ready - Clear browser localStorage (clear old token), relogin, check console "isAllowed: true"

**FULL FIX: Merge + 403 resolved for "Manager" admin.**
