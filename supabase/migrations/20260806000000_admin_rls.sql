-- =============================================
-- Admin RLS: service_role 경유 전체 허용 정책
-- (모든 write는 서버 API에서 service_role 키로만 수행)
-- =============================================

-- competitions
create policy "service role all competitions" on competitions
  for all using (true)
  with check (true);

-- divisions
create policy "service role all divisions" on divisions
  for all using (true)
  with check (true);

-- participants
create policy "service role all participants" on participants
  for all using (true)
  with check (true);

-- applications
create policy "service role all applications" on applications
  for all using (true)
  with check (true);

-- payments
create policy "service role all payments" on payments
  for all using (true)
  with check (true);

-- attachments
create policy "service role all attachments" on attachments
  for all using (true)
  with check (true);

-- notices (service role overrides public read policy)
create policy "service role all notices" on notices
  for all using (true)
  with check (true);

-- results
create policy "service role all results" on results
  for all using (true)
  with check (true);

-- message_templates
create policy "service role all message_templates" on message_templates
  for all using (true)
  with check (true);

-- message_logs
create policy "service role all message_logs" on message_logs
  for all using (true)
  with check (true);

-- admin_action_logs
create policy "service role all admin_action_logs" on admin_action_logs
  for all using (true)
  with check (true);
