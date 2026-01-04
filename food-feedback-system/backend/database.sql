-- Annaseva.ai Database Schema
-- SQLite Database

-- Feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('emoji', 'text', 'voice')),
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    message TEXT,
    emoji TEXT,
    timestamp TEXT NOT NULL
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    items TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    servings INTEGER NOT NULL,
    rating REAL DEFAULT 0,
    timestamp TEXT NOT NULL
);

-- Surplus food table
CREATE TABLE IF NOT EXISTS surplus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quantity_kg REAL NOT NULL,
    meal_type TEXT,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'allocated', 'collected')),
    ngo_name TEXT,
    pickup_time TEXT,
    timestamp TEXT NOT NULL
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surplus_id INTEGER,
    ngo_name TEXT NOT NULL,
    quantity_kg REAL NOT NULL,
    people_fed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    timestamp TEXT NOT NULL,
    FOREIGN KEY (surplus_id) REFERENCES surplus (id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedbacks_timestamp ON feedbacks(timestamp);
CREATE INDEX IF NOT EXISTS idx_meals_timestamp ON meals(timestamp);
CREATE INDEX IF NOT EXISTS idx_surplus_status ON surplus(status);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

-- Sample data for testing
INSERT INTO feedbacks (type, rating, emoji, message, timestamp) VALUES
('emoji', 5, '😊', NULL, datetime('now', '-1 day')),
('emoji', 4, '🙂', NULL, datetime('now', '-1 day')),
('text', NULL, NULL, 'Food was good but quantity was less', datetime('now', '-2 days')),
('emoji', 5, '😊', NULL, datetime('now', '-2 days')),
('emoji', 3, '😐', NULL, datetime('now', '-3 days'));

INSERT INTO meals (meal_type, items, quantity, servings, rating, timestamp) VALUES
('lunch', 'Dal, Rice, Roti, Sabzi', 50, 245, 4.5, datetime('now')),
('breakfast', 'Poha, Tea', 30, 198, 4.2, datetime('now', '-5 hours')),
('dinner', 'Roti, Paneer Curry, Rice', 55, 232, 4.7, datetime('now', '-1 day')),
('lunch', 'Rajma, Rice, Roti', 52, 256, 4.4, datetime('now', '-1 day'));

INSERT INTO surplus (quantity_kg, meal_type, status, timestamp) VALUES
(15.5, 'lunch', 'available', datetime('now')),
(22.0, 'dinner', 'collected', datetime('now', '-1 day'));

INSERT INTO donations (surplus_id, ngo_name, quantity_kg, people_fed, status, timestamp) VALUES
(2, 'Feeding India', 22.0, 45, 'completed', datetime('now', '-1 day')),
(1, 'Akshaya Patra', 15.5, 32, 'scheduled', datetime('now'));