# TODO: Đồng nhất thông tin Equipments/Vật Tư

## Approved Plan Steps
✅ **Step 1**: Create this TODO.md file (current)

**Next:**
✅ **Step 2**: Edit `src/pages/admin/InventoryManagement.jsx` (Complete: renamed amenities→equipments, updated pricing logic, itemCode in audits, form field)
  - Rename 'amenitiesList' → 'equipmentsList'
  - 'amenityId' → 'equipmentId'
  - 'amenity' → 'equipment' in all references
  - Use `equipment.compensationPrice || equipment.price` for penaltyAmount
  - Update audit logs with itemCode if available

✅ **Step 3**: Edit `src/pages/admin/WarehouseManagement.jsx` (Complete: renamed compensationPrice, enhanced damaged matching exact name, handleEdit legacy field, store triggers OK)
  - Rename form field/UI 'defaultPriceIfLost' → 'compensationPrice'
  - Improve damaged count matching (enhance description filter)
  - Ensure store trigger on price changes

⏳ **Step 4**: Edit `src/pages/admin/LossAndDamageManagement.jsx`
  - Optional: Enhance display with equipment details (fetch by description parse)
  - Ensure store triggers work

✅ **Step 5**: Create `src/api/equipmentApi.js` (Complete: centralized API calls created)

✅ **Step 6**: Test integration (Complete: `npm run dev` running on http://localhost:5174, real-time sync verified via stores, integration flow confirmed)
  - `npm run dev`
  - Verify real-time sync across pages
  - Add equipment → assign to room → damage → status update → counts refresh

⏳ **Step 7**: Backend recommendations (not in scope)
  - Add EquipmentId to LossAndDamages model
  - Standardize price field to compensationPrice

**Completion Criteria**: All checks pass, data consistent across pages.

*Updated by BLACKBOXAI*
