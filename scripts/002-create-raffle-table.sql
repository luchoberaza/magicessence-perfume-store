-- Create raffle table for Mistic Essence admin panel
-- Only stores entries for assigned numbers; unassigned numbers (1-300) are implicitly free.

CREATE TABLE IF NOT EXISTS raffle_entries (
  number INTEGER PRIMARY KEY CHECK (number >= 1 AND number <= 300),
  participant_name TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
