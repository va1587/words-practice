import { Migration } from '@mikro-orm/migrations';

export class Migration20261015090929 extends Migration {

  override name = 'Migration20261015090929';

  override up(): void | Promise<void> {
    this.addSql(`create table "learning_path" ("id" serial primary key, "slug" varchar(255) not null, "title" varchar(255) not null, "tagline" varchar(255) not null, "description" text not null, "level" text not null, "hours" int not null, "tags" text[] not null default '{}', "featured" boolean not null default false, "position" int not null default 0);`);
    this.addSql(`alter table "learning_path" add constraint "learning_path_slug_unique" unique ("slug");`);

    this.addSql(`create table "path_module" ("id" serial primary key, "title" varchar(255) not null, "position" int not null, "path_id" int not null);`);

    this.addSql(`create table "lesson" ("id" serial primary key, "slug" varchar(255) not null, "title" varchar(255) not null, "minutes" int not null, "summary" text not null, "body" text[] not null default '{}', "exercise" text not null, "position" int not null, "module_id" int not null);`);
    this.addSql(`alter table "lesson" add constraint "lesson_module_id_slug_unique" unique ("module_id", "slug");`);

    this.addSql(`create table "app_user" ("id" serial primary key, "email" varchar(255) not null, "name" varchar(255) not null, "streak_days" int not null default 0);`);
    this.addSql(`alter table "app_user" add constraint "app_user_email_unique" unique ("email");`);

    this.addSql(`create table "lesson_completion" ("id" serial primary key, "user_id" int not null, "lesson_id" int not null, "completed_at" timestamptz not null);`);
    this.addSql(`alter table "lesson_completion" add constraint "lesson_completion_user_id_lesson_id_unique" unique ("user_id", "lesson_id");`);

    this.addSql(`create table "enrollment" ("id" serial primary key, "user_id" int not null, "path_id" int not null, "enrolled_at" timestamptz not null);`);
    this.addSql(`alter table "enrollment" add constraint "enrollment_user_id_path_id_unique" unique ("user_id", "path_id");`);

    this.addSql(`alter table "learning_path" add constraint "learning_path_level_check" check ("level" in ('beginner', 'intermediate', 'advanced'));`);

    this.addSql(`alter table "path_module" add constraint "path_module_path_id_foreign" foreign key ("path_id") references "learning_path" ("id") on delete cascade;`);

    this.addSql(`alter table "lesson" add constraint "lesson_module_id_foreign" foreign key ("module_id") references "path_module" ("id") on delete cascade;`);

    this.addSql(`alter table "lesson_completion" add constraint "lesson_completion_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on delete cascade;`);
    this.addSql(`alter table "lesson_completion" add constraint "lesson_completion_lesson_id_foreign" foreign key ("lesson_id") references "lesson" ("id") on delete cascade;`);

    this.addSql(`alter table "enrollment" add constraint "enrollment_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on delete cascade;`);
    this.addSql(`alter table "enrollment" add constraint "enrollment_path_id_foreign" foreign key ("path_id") references "learning_path" ("id") on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "path_module" drop constraint "path_module_path_id_foreign";`);
    this.addSql(`alter table "enrollment" drop constraint "enrollment_path_id_foreign";`);
    this.addSql(`alter table "lesson" drop constraint "lesson_module_id_foreign";`);
    this.addSql(`alter table "lesson_completion" drop constraint "lesson_completion_lesson_id_foreign";`);
    this.addSql(`alter table "lesson_completion" drop constraint "lesson_completion_user_id_foreign";`);
    this.addSql(`alter table "enrollment" drop constraint "enrollment_user_id_foreign";`);

    this.addSql(`drop table if exists "learning_path" cascade;`);
    this.addSql(`drop table if exists "path_module" cascade;`);
    this.addSql(`drop table if exists "lesson" cascade;`);
    this.addSql(`drop table if exists "app_user" cascade;`);
    this.addSql(`drop table if exists "lesson_completion" cascade;`);
    this.addSql(`drop table if exists "enrollment" cascade;`);
  }

}
