-- Add human takeover system to potential_clients
ALTER TABLE potential_clients 
ADD COLUMN IF NOT EXISTS takeover_state TEXT DEFAULT 'AI_ACTIVE' CHECK (takeover_state IN ('AI_ACTIVE', 'HUMAN_REQUESTED', 'ASSIGNED', 'HUMAN_ACTIVE', 'COMPLETED', 'CANCELLED')),
ADD COLUMN IF NOT EXISTS assigned_employee_id UUID,
ADD COLUMN IF NOT EXISTS takeover_employee_id UUID,
ADD COLUMN IF NOT EXISTS takeover_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whatsapp_account_id TEXT,
ADD COLUMN IF NOT EXISTS takeover_released_by UUID,
ADD COLUMN IF NOT EXISTS takeover_released_at TIMESTAMP WITH TIME ZONE;

-- Create conversation_messages table for persistent message history
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversation_messages_phone ON conversation_messages(phone);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_whatsapp_account ON conversation_messages(whatsapp_account_id);

-- Create notifications table
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

-- Create index for employee notifications
CREATE INDEX IF NOT EXISTS idx_notifications_employee_id ON notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable realtime for modified tables
DO $$
BEGIN
    -- Add tables to realtime publication if not already present
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'potential_clients'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE potential_clients;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'customer_service_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE customer_service_requests;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversation_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
END $$;
