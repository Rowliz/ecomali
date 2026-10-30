const { connect, User } = require('./server/src/db');
const Role = require('./server/src/models/Role');
const bcrypt = require('bcryptjs');

(async () => {
  await connect();
  const superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
  const passwordHash = bcrypt.hashSync('Ibrahim2002', 10);
  await User.updateOne(
    { email: 'ibrahimirungu694@gmail.com' },
    {
      $set: {
        name: 'Ibrahim',
        email: 'ibrahimirungu694@gmail.com',
        username: 'ibrahim2002',
        passwordHash,
        role: superAdminRole ? superAdminRole._id : undefined,
        userRole: 'super_admin',
        status: 'active'
      }
    },
    { upsert: true }
  );
  console.log('Super admin user updated.');
  process.exit(0);
})();
