# SSMS Database Migration

## Structure
```
N/database/ssms/
├── schema/
│   ├── 00-schema.sql           # Table creation only
│   └── 00-complete-setup.sql     # Tables + stored procedures (combined)
└── programming/
    ├── functions/
    │   └── common.sql           # SQL functions
    └── stored_procedure/
        ├── master-procedures.sql  # ALL procedures in one file (run this after tables)
        ├── banners.sql
        ├── users.sql
        ├── categories.sql
        ├── products.sql
        ├── coupons.sql
        ├── cart.sql
        └── orders.sql
```

## Flag-Based Stored Procedures

Each procedure uses `@Flag` parameter:
- `usp_Banner`: `C`=Create, `R`=Read, `U`=Update, `D`=Delete
- `usp_User`: `C`=Create, `R`=Read, `U`=Update, `E`=Exists check
- `usp_Category`: `C`=Create, `R`=Read, `U`=Update, `D`=Delete
- `usp_Product`: `C`=Create, `R`=Read, `U`=Update, `D`=Delete
- `usp_Coupon`: `C`=Create, `R`=Read, `U`=Update, `D`=Delete
- `usp_Cart`: `C`=Create, `R`=Read, `I`=Insert item
- `usp_Order`: `C`=Create, `R`=Read, `I`=Insert items, `A`=Insert address

## Running the SQL

### Option 1: Single file execution (recommended)
```powershell
# Run both files in order
sqlcmd -S tcp:db51809.databaseasp.net,1433 -U db51809 -P db51809 -d db51809 -i "N/database/ssms/schema/00-complete-setup.sql"
```

### Option 2: SSMS GUI
1. Open SSMS
2. Connect to `db51809.databaseasp.net` port 1433
3. Open `N/database/ssms/schema/00-complete-setup.sql`
4. Execute (F5)

## Node.js Repository Usage

```javascript
// getActive banners
await bannerRepo.findActive();

// create banner
await bannerRepo.create({ title, image_url, link_url });

// update banner
await bannerRepo.update(id, { title, is_active: true });

// delete banner
await bannerRepo.remove(id);
```

All repositories now call stored procedures via `executeStoredProcedure('usp_Banner', { Flag: 'C', ... })`.