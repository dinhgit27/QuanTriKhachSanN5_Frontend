## ADD SEARCH/FILTER TO ADD MODAL ✅

**Complete:** 
- State `addSearchText`, `filteredAmenities` realtime search
- Modal UI với Input.Search + counter "X/Y vật tư"
- Select dropdown uses filteredAmenities (search inside dropdown)
- Reset khi mở modal

Test: `/admin/inventory` → room → "Thêm Vật Tư" → search tên vật tư ✅


## Plan Steps:
- [x] Step 1: Add new states (searchText, filterStatus) and filteredInventory computed value
- [ ] Step 2: Add search/filter UI components above Table in modal
- [ ] Step 3: Update Table dataSource to use filteredInventory
- [ ] Step 4: Add reset logic on modal close/room change
- [ ] Step 5: Test and attempt_completion

# TODO: COMPLETE ✅

## Plan Steps:
- [x] Step 1: Add new states (searchText, filterStatus) and filteredInventory computed value
- [x] Step 2: Add search/filter UI components above Table in modal
- [x] Step 3: Update Table dataSource to use filteredInventory
- [x] Step 4: Add reset logic on modal close/room change
- [x] Step 5: Test and attempt_completion

**All steps completed. Changes implemented in src/pages/admin/InventoryManagement.jsx**
