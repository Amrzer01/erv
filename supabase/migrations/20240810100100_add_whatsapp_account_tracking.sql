-- Add online status to accounts table for real-time status tracking
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

-- Create index for online accounts
CREATE INDEX IF NOT EXISTS idx_accounts_is_online ON accounts(is_online) WHERE is_online = true;
