-- Seed data. Run AFTER 00-schema.sql.
-- Admin password is 'Admin@123' hashed with bcrypt (cost 10).
-- To regenerate: node -e "import('bcryptjs').then(b => console.log(b.default.hashSync('Admin@123', 10)))"

INSERT INTO users (name, email, password_hash, role, phone, is_verified, is_banned)
VALUES (
    'Admin User',
    'admin@n.test',
    '$2b$10$M2C9nto5fLwEO/LzNQ11BeIvjxaFm.1MgPrXKNdk8Qzh2OCpsmGmm',
    'admin',
    '9800000000',
    1,
    0
);

INSERT INTO categories (name, slug, description, is_active) VALUES
    ('Electronics', 'electronics', 'Gadgets and devices', 1),
    ('Fashion',     'fashion',     'Clothing and accessories', 1),
    ('Home',        'home',        'Home and living', 1);

INSERT INTO banners (title, image_url, position, is_active, sort_order)
VALUES
    ('Welcome to N', 'https://placehold.co/1200x400', 'home', 1, 0),
    ('Big Sale',     'https://placehold.co/1200x400', 'home', 1, 1);
