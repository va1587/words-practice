import { Migration } from '@mikro-orm/migrations';

export class Migration20261015093931_foreign_key_indexes extends Migration {

  override name = 'Migration20261015093931_foreign_key_indexes';

  override up(): void | Promise<void> {
    this.addSql(`create index "path_module_path_id_index" on "path_module" ("path_id");`);

    this.addSql(`create index "lesson_completion_lesson_id_index" on "lesson_completion" ("lesson_id");`);

    this.addSql(`create index "enrollment_path_id_index" on "enrollment" ("path_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop index "enrollment_path_id_index";`);

    this.addSql(`drop index "lesson_completion_lesson_id_index";`);

    this.addSql(`drop index "path_module_path_id_index";`);
  }

}
