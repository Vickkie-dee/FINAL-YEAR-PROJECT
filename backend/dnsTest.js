const dns = require('dns').promises;

const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4']);

async function test() {
  try {
    const result = await resolver.resolveMx('gmail.com');

    console.log('SUCCESS:', result);
  } catch (err) {
    console.log('ERROR CODE:', err.code);
    console.log('FULL ERROR:', err.message);
  }
}

test();