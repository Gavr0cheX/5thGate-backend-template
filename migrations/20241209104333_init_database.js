exports.up = async function(knex) {
    // Create ref_roles table
    await knex.schema.createTable('ref_roles', (table) => {
      table.increments('id').primary();
      table.string('role').notNullable();
    });
  
    // Insert roles data into ref_roles
    await knex('ref_roles').insert([
      { id: 1001, role: 'Admin' },
      { id: 2001, role: 'User' }
    ]);
  
    // Create users table
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
  
    // Create user_roles table
    await knex.schema.createTable('user_roles', (table) => {
      table.increments('id').primary();
      table.integer('uid').unsigned().notNullable();
      table.integer('role_id').unsigned().notNullable();
    });
  
    // Create units table
    await knex.schema.createTable('units', (table) => {
      table.increments('id').primary();
      table.float('price').notNullable();
      table.string('status').notNullable();
      table.integer('client_id').unsigned().nullable();
      table.integer('sales_principal_id').unsigned().nullable();
      table.string('type').notNullable();
      table.float('area').notNullable();
      table.integer('floor').notNullable();
      table.enum('rent_or_sale', ['rent', 'sale']).notNullable();
      table.string('finishing').notNullable();
      table.integer('room_number').notNullable();
      table.integer('bathroom_number').notNullable();
    });
  
    // Insert initial admin user (with roles)
    await knex('users').insert([
      {
        id: 24,
        username: 'loay',
        email: 'loaymelkholy@gmail.com',
        phone: '234325345',
        password: '$2b$10$iOzZ4VCtN8PyLPVilV4zuuWtk.2x2m1Vdx0cA2JWCtsRSB/sjLg1S', // hashed password
        fullname: 'Loay Elkholy',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxvYXkiLCJpYXQiOjE3MzM3NDAyMzksImV4cCI6MTczNDM0NTAzOX0.5_Bgc5Vvotfv8dPGz2JaxrxNSgHnnzk6NuL03pBvrUo',
        main_uid: null
      }
    ]);
  
    // Insert roles for this user (Admin and Sales Principal)
    await knex('user_roles').insert([
      { uid: 24, role_id: 1001 }
    ]);
  };
  
  exports.down = async function(knex) {
    // Drop tables in reverse order
    await knex.schema
      .dropTableIfExists('clients')
      .dropTableIfExists('units')
      .dropTableIfExists('user_roles')
      .dropTableIfExists('users')
      .dropTableIfExists('ref_roles');
  };
  