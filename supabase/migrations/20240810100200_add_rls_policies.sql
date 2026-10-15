-- RLS Policies for Human Takeover System

-- Enable RLS on new tables
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Conversation Messages Policies
-- All authenticated users can read messages (for transparency)
DROP POLICY IF EXISTS "Conversation messages public read" ON conversation_messages;
CREATE POLICY "Conversation messages public read"
ON conversation_messages FOR SELECT
TO authenticated
USING (true);

-- Service role can insert messages (from bot)
DROP POLICY IF EXISTS "Conversation messages service insert" ON conversation_messages;
CREATE POLICY "Conversation messages service insert"
ON conversation_messages FOR INSERT
TO service_role
WITH CHECK (true);

-- Service role can update messages
DROP POLICY IF EXISTS "Conversation messages service update" ON conversation_messages;
CREATE POLICY "Conversation messages service update"
ON conversation_messages FOR UPDATE
TO service_role
WITH CHECK (true);

-- Notifications Policies
-- Employees can only read their own notifications
DROP POLICY IF EXISTS "Notifications employee read own" ON notifications;
CREATE POLICY "Notifications employee read own"
ON notifications FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

-- Service role can insert notifications
DROP POLICY IF EXISTS "Notifications service insert" ON notifications;
CREATE POLICY "Notifications service insert"
ON notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- Employees can mark their own notifications as read
DROP POLICY IF EXISTS "Notifications employee update own" ON notifications;
CREATE POLICY "Notifications employee update own"
ON notifications FOR UPDATE
TO authenticated
USING (employee_id = auth.uid())
WITH CHECK (employee_id = auth.uid());

-- Potential Clients Policies - ensure RLS is enabled but permissive for existing access
ALTER TABLE potential_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Potential clients employee read" ON potential_clients;
CREATE POLICY "Potential clients employee read"
ON potential_clients FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Potential clients service update" ON potential_clients;
CREATE POLICY "Potential clients service update"
ON potential_clients FOR UPDATE
TO service_role
WITH CHECK (true);

-- Customer Service Requests Policies - ensure RLS is enabled but permissive for existing access
ALTER TABLE customer_service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service requests employee read" ON customer_service_requests;
CREATE POLICY "Service requests employee read"
ON customer_service_requests FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Service requests service update" ON customer_service_requests;
CREATE POLICY "Service requests service update"
ON customer_service_requests FOR UPDATE
TO service_role
WITH CHECK (true);
