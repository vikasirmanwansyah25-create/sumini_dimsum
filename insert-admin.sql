-- Insert sample data
INSERT INTO users (username, password, nama, role)
VALUES ('admin', 'admin123', 'Admin', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Cek data
SELECT * FROM users;
