CREATE TABLE IF NOT EXISTS local_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS update_local_subscriptions_timestamp
AFTER UPDATE ON local_subscriptions
FOR EACH ROW
BEGIN
    UPDATE local_subscriptions
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;