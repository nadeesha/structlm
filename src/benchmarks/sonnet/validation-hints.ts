#!/usr/bin/env node
import { config } from 'dotenv';
import { runComparison, printResults, BenchmarkConfig } from './validation-hints-runner.js';
import { resolve } from 'path';

// Load environment variables from .env file in the same directory
config({ path: resolve(import.meta.dirname, '.env') });

const sampleInputTexts = [
  `User Profile Data:
  ID: usr_12345
  Username: john_doe
  Email: john.doe@example.com
  Age: 28
  Status: Active
  Roles: ["user", "premium"]
  
  Personal Information:
  First Name: John
  Last Name: Doe
  Bio: Software engineer with 5+ years experience in web development
  Website: https://johndoe.dev
  
  Preferences:
  Theme: dark
  Language: en
  Notifications: enabled
  
  Timestamps:
  Created: 2023-01-15T10:30:00Z
  Last Login: 2024-03-18T14:22:00Z`,
  
  `Customer Record:
  Customer ID: cust_67890
  Handle: sarah_smith
  Contact: sarah.smith@gmail.com
  Age: 35
  Account Status: Active
  Access Levels: ["admin", "moderator"]
  
  Profile Details:
  Given Name: Sarah
  Family Name: Smith
  About: Marketing manager passionate about digital transformation
  Personal Site: https://sarahsmith.com
  
  Settings:
  UI Theme: light
  Locale: fr
  Push Notifications: true
  
  Account History:
  Registration Date: 2022-08-22T09:15:00Z
  Recent Activity: 2024-03-18T16:45:00Z`,
  
  `Member Information:
  Member ID: mem_abc123
  Display Name: alex_wilson
  Email Address: alex.wilson@company.com
  Current Age: 42
  Active Status: true
  User Roles: ["employee", "team_lead"]
  
  Personal Data:
  First: Alex
  Last: Wilson
  Biography: Product manager with expertise in agile methodologies
  Portfolio: https://alexwilson.portfolio.com
  
  User Preferences:
  Theme Selection: auto
  Language Code: es
  Notifications Enabled: false
  
  Audit Trail:
  Created On: 2021-03-10T11:20:00Z
  Last Seen: 2024-03-17T13:30:00Z`,
  
  `Account Details:
  Account Number: acc_xyz789
  User Name: emma_brown
  Email: emma.brown@startup.io
  Age: 26
  Is Active: true
  Permissions: ["user"]
  
  Profile Information:
  First Name: Emma
  Last Name: Brown
  Description: UX designer focused on accessibility and user research
  Website URL: http://emmabrown.design
  
  Configuration:
  Display Theme: light
  Language: de
  Alert Preferences: true
  
  Timeline:
  Account Created: 2023-11-05T14:45:00Z
  Last Login Time: 2024-03-18T09:12:00Z`,
  
  `User Account:
  User ID: user_def456
  Username: mike_johnson
  Email Address: mike.johnson@freelancer.com
  Age in Years: 31
  Account Active: yes
  Role Assignment: ["freelancer", "verified"]
  
  Personal Details:
  Given Name: Mike
  Surname: Johnson
  Personal Bio: Full-stack developer specializing in React and Node.js
  Professional Website: https://mikejohnson.dev
  
  Preferences:
  Color Theme: dark
  Language Setting: pt
  Notification Status: disabled
  
  Account Metadata:
  Registration: 2022-06-18T16:30:00Z
  Last Activity: 2024-03-18T11:55:00Z`
];

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }

  const iterations = parseInt(process.env.BENCHMARK_ITERATIONS || '3');
  
  const config: BenchmarkConfig = {
    iterations,
    apiKey,
    inputTexts: sampleInputTexts
  };

  try {
    console.log(`🚀 Running validation hints benchmark with ${iterations} iterations per method...`);
    console.log(`📝 Using ${sampleInputTexts.length} different input texts\n`);
    
    const results = await runComparison(config);
    printResults(results);
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `benchmark-results/validation-hints-results-${timestamp}.json`;
    
    await import('fs').then(fs => {
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`\n💾 Results saved to: ${filename}`);
    });
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}