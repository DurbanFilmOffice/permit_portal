-- Step 1: Add new text column
ALTER TABLE permits ADD COLUMN status_new text NOT NULL DEFAULT 'draft';

-- Step 2: Copy and remap existing values
UPDATE permits SET status_new = CASE
  WHEN status::text = 'under_review' THEN 'in_review'
  WHEN status::text = 'returned'     THEN 'incomplete'
  ELSE status::text
END;

-- Step 3: Drop old enum column
ALTER TABLE permits DROP COLUMN status;

-- Step 4: Rename new column
ALTER TABLE permits RENAME COLUMN status_new TO status;

-- Step 5: Drop the enum type
DROP TYPE IF EXISTS permit_status;