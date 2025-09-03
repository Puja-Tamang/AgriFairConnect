-- Add CropPhoto column to MarketPrices table
-- This script adds the CropPhoto column to the existing MarketPrices table

-- Check if column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MarketPrices' 
        AND column_name = 'CropPhoto'
    ) THEN
        -- Add the CropPhoto column
        ALTER TABLE "MarketPrices" ADD COLUMN "CropPhoto" VARCHAR(500);
        RAISE NOTICE 'CropPhoto column added successfully to MarketPrices table';
    ELSE
        RAISE NOTICE 'CropPhoto column already exists in MarketPrices table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'MarketPrices' 
AND column_name = 'CropPhoto';
