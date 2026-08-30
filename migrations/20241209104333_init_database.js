exports.up = async function (knex) {
  await knex.schema.createTable('ref_roles', (table) => {
    table.increments('id').primary();
    table.string('role').notNullable();
  });

  await knex('ref_roles').insert([
    { id: 1001, role: 'Admin' },
    { id: 2001, role: 'User' },
  ]);

  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 45).notNullable().unique();
    table.string('email', 45).nullable().unique();
    table.string('phone', 16).notNullable().unique();
    table.string('password', 255).notNullable();
    table.text('fullname').notNullable();
    table.string('refreshToken', 255).nullable();
    table.integer('main_uid').nullable();
  });

  await knex.schema.createTable('user_roles', (table) => {
    table.increments('id').primary();
    table.integer('uid').unsigned().notNullable();
    table.integer('role_id').unsigned().notNullable();
    table.foreign('uid').references('users.id').onDelete('CASCADE');
    table.foreign('role_id').references('ref_roles.id').onDelete('CASCADE');
  });
};

exports.down = async function (knex) {
  await knex.schema
    .dropTableIfExists('user_roles')
    .dropTableIfExists('users')
    .dropTableIfExists('ref_roles');
};
