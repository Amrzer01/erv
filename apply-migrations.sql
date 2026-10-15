-- ============================================
-- HUMAN HANDOFF SYSTEM MIGRATIONS
-- ============================================
-- Execute this SQL in Supabase Dashboard > SQL Editor
-- ============================================

-- Step 1: Add takeover columns to potential_clients
ALTER TABLE potential_clients 
ADD COLUMN IF NOT EXISTS takeover_state TEXT DEFAULT 'AI_ACTIVE' CHECK (takeover_state IN ('AI_ACTIVE', 'HUMAN_REQUESTED', 'ASSIGNED', 'HUMAN_ACTIVE', 'COMPLETED', 'CANCELLED')),
ADD COLUMN IF NOT EXISTS assigned_employee_id UUID,
ADD COLUMN IF NOT EXISTS takeover_employee_id UUID,
ADD COLUMN IF NOT EXISTS takeover_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whatsapp_account_id TEXT,
ADD COLUMN IF NOT EXISTS takeover_released_by UUID,
ADD COLUMN IF NOT EXISTS takeover_released_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Add takeover columns to customer_service_requests
ALTER TABLE customer_service_requests
ADD COLUMN IF NOT EXISTS takeover_employee_id UUID,
ADD COLUMN IF NOT EXISTS takeover_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS takeover_released_by UUID,
ADD COLUMN IF NOT EXISTS takeover_released_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Create conversation_messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  whatsapp_account_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'bot', 'employee')),
  employee_id UUID,
  message_type TEXT DEFAULT 'text',
  message_text TEXT NOT NULL,
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_phone ON conversation_messages(phone);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_whatsapp_account ON conversation_messages(whatsapp_account_id);

-- Step 4: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('human_support_request', 'assignment', 'message', 'booking_conversion')),
  title TEXT NOT NULL,
  message TEXT,
  phone TEXT,
  potential_client_id UUID,
  customer_service_request_id UUID,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_employee_id ON notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Step 5: Add WhatsApp account tracking
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_accounts_is_online ON accounts(is_online) WHERE is_online = true;

-- Step 6: Enable RLS
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE potential_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_service_requests ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
-- Conversation Messages Policies
CREATE POLICY IF NOT EXISTS "Conversation messages public read"
ON conversation_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY IF NOT EXISTS "Conversation messages service insert"
ON conversation_messages FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Conversation messages service update"
ON conversation_messages FOR UPDATE
TO service_role
WITH CHECK (true);

-- Notifications Policies
CREATE POLICY IF NOT EXISTS "Notifications employee read own"
ON notifications FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Notifications service insert"
ON notifications FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Notifications employee update own"
ON notifications FOR UPDATE
TO authenticated
USING (employee_id = auth.uid())
WITH CHECK (employee_id = auth.uid());

-- Potential Clients Policies
CREATE POLICY IF NOT EXISTS "Potential clients employee read"
ON potential_clients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY IF NOT EXISTS "Potential clients service update"
ON potential_clients FOR UPDATE
TO service_role
WITH CHECK (true);

-- Customer Service Requests Policies
CREATE POLICY IF NOT EXISTS "Service requests employee read"
ON customer_service_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY IF NOT EXISTS "Service requests service update"
ON customer_service_requests FOR UPDATE
TO service_role
WITH CHECK (true);

-- Step 8: Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE potential_clients;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
