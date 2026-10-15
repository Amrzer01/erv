-- Add is_super_admin column to employees table
-- This will be used to identify the initial administrator
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_is_super_admin ON employees(is_super_admin);

-- Add index for auth_user_id lookups
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON employees(auth_user_id);
