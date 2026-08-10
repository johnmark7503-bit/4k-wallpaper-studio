CREATE TABLE `ai_daily_quota` (
	`quota_key` text NOT NULL,
	`quota_date` text NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`quota_key`, `quota_date`)
);
