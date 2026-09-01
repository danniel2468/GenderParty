-- 目前 Supabase Project 已建立相同結構，本檔案僅供日後重建使用。
create table if not exists public."GenderTbl" (
  "NickName" varchar primary key,
  "Gender" varchar check ("Gender" in ('男', '女')),
  "VoteDate" timestamp default current_timestamp
);

alter table public."GenderTbl" enable row level security;

-- 手機瀏覽器不可直接操作資料表；僅允許 Vercel API 使用 Secret Key 存取。
revoke all on table public."GenderTbl" from anon, authenticated;
grant select, insert, update on table public."GenderTbl" to service_role;
