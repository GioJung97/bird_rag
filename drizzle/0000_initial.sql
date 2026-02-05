CREATE TABLE `conversations` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `title` text
);

--> statement-breakpoint

CREATE TABLE `messages` (
  `id` text PRIMARY KEY NOT NULL,
  `conversation_id` text NOT NULL,
  `role` text NOT NULL,
  `text` text,
  `image_path` text,
  `image_name` text,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint

CREATE INDEX `messages_conversation_id_idx` ON `messages` (`conversation_id`);
--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);
