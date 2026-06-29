-- Check existing table structures
SELECT 'banners' as table_name, name as column_name FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[banners]')
UNION ALL
SELECT 'orders' as table_name, name as column_name FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[orders]');