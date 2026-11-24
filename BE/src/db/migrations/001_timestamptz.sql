-- Đổi mọi cột thời gian từ TIMESTAMP (không múi giờ) sang TIMESTAMPTZ.
--
-- Lý do: DB chạy giờ UTC nhưng cột TIMESTAMP không lưu múi giờ, nên API trả về
-- "2026-11-25T02:00:00" (thiếu "Z"). Trình duyệt hiểu đó là giờ địa phương
-- → hiển thị lệch 7 tiếng ở Việt Nam. Với TIMESTAMPTZ, API trả "...+00:00"
-- và trình duyệt tự đổi đúng sang giờ địa phương.
--
-- Dữ liệu cũ được hiểu là giờ UTC (đúng với cách đang lưu).
-- Chạy được nhiều lần: cột nào đã là TIMESTAMPTZ thì bỏ qua.
--
-- Cách chạy (Docker):
--   docker exec -i unijob_postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < src/db/migrations/001_timestamptz.sql

BEGIN;

DO $$
DECLARE
    col RECORD;
BEGIN
    FOR col IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND data_type = 'timestamp without time zone'
    LOOP
        EXECUTE format(
            'ALTER TABLE %I ALTER COLUMN %I TYPE TIMESTAMPTZ USING %I AT TIME ZONE ''UTC''',
            col.table_name, col.column_name, col.column_name
        );
        RAISE NOTICE 'Đã đổi %.% sang TIMESTAMPTZ', col.table_name, col.column_name;
    END LOOP;
END $$;

COMMIT;
