import pg from 'pg';
const { Client } = pg;

const users = ['postgres', 'admin', 'IMS Julies_db', 'jeahjeah', 'Julie'];
const passwords = ['jeahjeah77', 'jeahjeah', 'jeahjeah77 ', ' jeahjeah77', 'Jeahjeah77', 'postgres', 'admin', '123456', 'password'];

async function testConnection() {
  for (const pw of passwords) {
    for (const user of users) {
      console.log(`Testing user: "${user}" with password: "${pw}"...`);
      const client = new Client({
        host: '127.0.0.1',
        port: 5432,
        user,
        password: pw,
        database: 'postgres',
        connectionTimeoutMillis: 500,
      });

      try {
        await client.connect();
        console.log(`✅ SUCCESS! User "${user}" connected with password "${pw}"`);
        await client.end();
        return;
      } catch (err) {
        // Only log if it's NOT a password error (to keep logs clean) or log everything if needed
        // console.log(`❌ Failed: ${err.message}`);
      }
    }
  }
  console.log('Finished testing all combinations.');
}

testConnection();
