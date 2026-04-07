-- 기존 diet_records 테이블에 weight 컬럼 추가
ALTER TABLE diet_records ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);
