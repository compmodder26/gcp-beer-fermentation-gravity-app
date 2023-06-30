CREATE SCHEMA IF NOT EXISTS `beer-gravity-tracker.data`;

CREATE TABLE IF NOT EXISTS `beer-gravity-tracker.data.batches`
(
  `id` INTEGER NOT NULL PRIMARY KEY NOT ENFORCED,
  `name` STRING NOT NULL,
  `target_gravity` FLOAT64 NOT NULL,
  `original_gravity` FLOAT64 NOT NULL 
);

CREATE TABLE IF NOT EXISTS `beer-gravity-tracker.data.readings`
(
  `batch_id` INTEGER NOT NULL,
  `reading` FLOAT64 NOT NULL,
  `tstamp` TIMESTAMP NOT NULL
);

ALTER TABLE `beer-gravity-tracker.data.readings` ADD CONSTRAINT fk_readings_to_batches FOREIGN KEY (`batch_id`) REFERENCES `beer-gravity-tracker.data.batches`(`id`) NOT ENFORCED; 
