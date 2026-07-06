-- 0008_add_attendance_columns.sql

-- Add attendance tracking support to production crew members
alter table public.production_members add column if not exists attendance text default 'Present';

-- Add attendance tracking support to cast/actors
alter table public.cast_members add column if not exists attendance text default 'Present';
