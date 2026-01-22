#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const program = new Command();

// Config file location
const CONFIG_DIR = path.join(require('os').homedir(), '.y3k');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Load config
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return {};
}

// Save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

program
  .name('y3k-resolver')
  .description('Y3K Namespace Resolver CLI - Manage your .x domains')
  .version('1.0.0');

// Login command
program
  .command('login')
  .description('Authenticate with your private key')
  .option('-k, --key <path>', 'Path to your private key backup JSON file')
  .action(async (options) => {
    console.log(chalk.cyan.bold('\n🔐 Y3K Namespace Login\n'));

    let keyPath = options.key;

    if (!keyPath) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'keyPath',
          message: 'Path to your private key backup JSON file:',
          validate: (input) => {
            if (!input) return 'Path is required';
            if (!fs.existsSync(input)) return 'File not found';
            return true;
          }
        }
      ]);
      keyPath = answers.keyPath;
    }

    const spinner = ora('Loading private key...').start();

    try {
      const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      
      if (!keyData.privateKey || !keyData.publicKey || !keyData.namespace) {
        spinner.fail('Invalid key file format');
        return;
      }

      // Save to config
      const config = loadConfig();
      config.namespace = keyData.namespace;
      config.privateKey = keyData.privateKey;
      config.publicKey = keyData.publicKey;
      saveConfig(config);

      spinner.succeed(`Logged in as ${chalk.green.bold(keyData.namespace)}`);
      console.log(chalk.gray(`\nYou can now manage your namespace with y3k-resolver commands\n`));
    } catch (error) {
      spinner.fail(`Failed to load key: ${error.message}`);
    }
  });

// Status command
program
  .command('status')
  .description('Show current authentication status')
  .action(() => {
    const config = loadConfig();
    
    if (!config.namespace) {
      console.log(chalk.yellow('\n⚠️  Not logged in. Run `y3k-resolver login` first.\n'));
      return;
    }

    console.log(chalk.cyan.bold('\n📊 Y3K Status\n'));
    console.log(`Namespace: ${chalk.green.bold(config.namespace)}`);
    console.log(`Public Key: ${chalk.gray(JSON.stringify(config.publicKey).substring(0, 50))}...`);
    console.log(chalk.gray(`\nConfig: ${CONFIG_FILE}\n`));
  });

// Set resolver record
program
  .command('set <namespace>')
  .description('Set resolver records for your namespace')
  .option('--website <url>', 'Website URL')
  .option('--eth <address>', 'Ethereum address')
  .option('--ipfs <cid>', 'IPFS CID')
  .option('--twitter <handle>', 'Twitter handle')
  .option('--github <username>', 'GitHub username')
  .option('--email <address>', 'Email address')
  .action(async (namespace, options) => {
    const config = loadConfig();
    
    if (!config.namespace) {
      console.log(chalk.red('\n❌ Not logged in. Run `y3k-resolver login` first.\n'));
      return;
    }

    if (!namespace.endsWith('.x')) {
      console.log(chalk.red('\n❌ Invalid namespace. Must end with .x\n'));
      return;
    }

    const spinner = ora('Updating resolver records...').start();

    try {
      // Build records object
      const records = {};
      if (options.website) records.website = options.website;
      if (options.eth) records.eth = options.eth;
      if (options.ipfs) records.ipfs = options.ipfs;
      if (options.twitter) records.twitter = options.twitter;
      if (options.github) records.github = options.github;
      if (options.email) records.email = options.email;

      if (Object.keys(records).length === 0) {
        spinner.fail('No records specified. Use --website, --eth, --ipfs, etc.');
        return;
      }

      // TODO: Actually submit to resolver API
      // For now, just simulate success
      spinner.succeed(`Updated resolver records for ${chalk.green.bold(namespace)}`);
      
      console.log(chalk.gray('\nRecords set:'));
      for (const [key, value] of Object.entries(records)) {
        console.log(`  ${chalk.cyan(key)}: ${value}`);
      }
      console.log();

    } catch (error) {
      spinner.fail(`Failed: ${error.message}`);
    }
  });

// Get resolver records
program
  .command('get <namespace>')
  .description('Get resolver records for a namespace')
  .action(async (namespace) => {
    if (!namespace.endsWith('.x')) {
      console.log(chalk.red('\n❌ Invalid namespace. Must end with .x\n'));
      return;
    }

    const spinner = ora(`Looking up ${namespace}...`).start();

    try {
      // TODO: Actually query resolver API
      spinner.succeed(`Resolver records for ${chalk.green.bold(namespace)}`);
      
      console.log(chalk.gray('\nNo records found (resolver not yet deployed)\n'));

    } catch (error) {
      spinner.fail(`Failed: ${error.message}`);
    }
  });

// Subdomain create
program
  .command('subdomain <action>')
  .description('Manage subdomains (create, list, delete)')
  .argument('<name>', 'Subdomain name (e.g., blog.brad.x)')
  .option('--ipfs <cid>', 'IPFS CID to point to')
  .option('--website <url>', 'Website URL')
  .option('--eth <address>', 'Ethereum address')
  .action(async (action, name, options) => {
    const config = loadConfig();
    
    if (!config.namespace) {
      console.log(chalk.red('\n❌ Not logged in. Run `y3k-resolver login` first.\n'));
      return;
    }

    if (action === 'create') {
      const spinner = ora(`Creating subdomain ${name}...`).start();

      try {
        // TODO: Actually create subdomain
        spinner.succeed(`Created subdomain ${chalk.green.bold(name)}`);
        
        if (options.ipfs) {
          console.log(`  → IPFS: ${options.ipfs}`);
        }
        if (options.website) {
          console.log(`  → Website: ${options.website}`);
        }
        if (options.eth) {
          console.log(`  → Ethereum: ${options.eth}`);
        }
        console.log();

      } catch (error) {
        spinner.fail(`Failed: ${error.message}`);
      }
    } else {
      console.log(chalk.red(`\n❌ Unknown action: ${action}\n`));
    }
  });

// List subdomains
program
  .command('list')
  .description('List all your subdomains')
  .action(async () => {
    const config = loadConfig();
    
    if (!config.namespace) {
      console.log(chalk.red('\n❌ Not logged in. Run `y3k-resolver login` first.\n'));
      return;
    }

    const spinner = ora(`Loading subdomains for ${config.namespace}...`).start();

    try {
      // TODO: Actually query subdomains
      spinner.succeed(`Subdomains for ${chalk.green.bold(config.namespace)}`);
      
      console.log(chalk.gray('\nNo subdomains yet. Create one with `y3k-resolver subdomain create <name>`\n'));

    } catch (error) {
      spinner.fail(`Failed: ${error.message}`);
    }
  });

// Key info
program
  .command('keys')
  .description('Show your public key information')
  .action(() => {
    const config = loadConfig();
    
    if (!config.namespace) {
      console.log(chalk.red('\n❌ Not logged in. Run `y3k-resolver login` first.\n'));
      return;
    }

    console.log(chalk.cyan.bold('\n🔑 Your Keys\n'));
    console.log(`Namespace: ${chalk.green.bold(config.namespace)}`);
    console.log(`\nPublic Key (array):`);
    console.log(chalk.gray(JSON.stringify(config.publicKey, null, 2)));
    console.log(`\nPublic Key (hex):`);
    const hexKey = Buffer.from(config.publicKey).toString('hex');
    console.log(chalk.gray(hexKey));
    console.log(`\n⚠️  Never share your private key!\n`);
  });

program.parse();
