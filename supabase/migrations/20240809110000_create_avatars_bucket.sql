-- Create avatars storage bucket for profile pictures
-- Note: This needs to be run manually in Supabase dashboard or via SQL editor
-- as storage bucket creation requires admin privileges

-- Run this in Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Avatar Public Read" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Avatar Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Avatar Update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Avatar Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'avatars');
