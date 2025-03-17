const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://postgres:aGKLvz3sb5snRD4J@db.qmnggrbmkqjoqjsmusyf.supabase.co:5432/postgres?sslmode=require"
})

async function testConnection() {
  try {
    await client.connect()
    console.log('Successfully connected to the database!')
    
    const result = await client.query('SELECT NOW()')
    console.log('Current database time:', result.rows[0].now)
    
    await client.end()
  } catch (err) {
    console.error('Error connecting to the database:', err)
  }
}

testConnection() 