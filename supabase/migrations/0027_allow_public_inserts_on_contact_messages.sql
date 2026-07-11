-- 0027_allow_public_inserts_on_contact_messages.sql
-- Allow anonymous/public inserts on the contact_messages table so anyone can submit messages

DROP POLICY IF EXISTS "Allow public inserts for contact_messages" ON public.contact_messages;
CREATE POLICY "Allow public inserts for contact_messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);
