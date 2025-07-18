#!/usr/bin/env node
import { config } from 'dotenv';
import { runComparison, printResults, BenchmarkConfig } from './simple-object-runner.js';
import { resolve } from 'path';

// Load environment variables from .env file in the same directory
config({ path: resolve(import.meta.dirname, '.env') });

const sampleInputTexts = [
  `Here are some books from our catalog:
  "The Great Gatsby" by F. Scott Fitzgerald was published in 1925. It's a classic American novel priced at $12.99 and currently in stock.
  "To Kill a Mockingbird" by Harper Lee, published in 1960, is a powerful drama available for $14.50 and is in stock.
  "1984" by George Orwell from 1949 is a dystopian fiction book priced at $13.25 but currently out of stock.`,
  
  `Book inventory update:
  "Pride and Prejudice" by Jane Austen (1813) - Romance - $11.99 - Available
  "The Catcher in the Rye" by J.D. Salinger (1951) - Coming-of-age fiction - $13.75 - In stock
  "Lord of the Flies" by William Golding (1954) - Adventure fiction - $12.50 - Out of stock
  "The Chronicles of Narnia" by C.S. Lewis (1950) - Fantasy - $19.99 - Available`,
  
  `Our bookstore has these titles:
  Title: "Dune", Author: Frank Herbert, Year: 1965, Genre: Science Fiction, Price: $16.99, Stock: Yes
  Title: "The Hobbit", Author: J.R.R. Tolkien, Year: 1937, Genre: Fantasy, Price: $14.99, Stock: Yes
  Title: "Brave New World", Author: Aldous Huxley, Year: 1932, Genre: Dystopian, Price: $13.99, Stock: No`,
  
  `Latest arrivals:
  "Harry Potter and the Philosopher's Stone" by J.K. Rowling (1997) is a fantasy novel for $15.99, currently available.
  "The Da Vinci Code" by Dan Brown (2003) is a mystery thriller for $14.99, in stock.
  "Gone Girl" by Gillian Flynn (2012) is a psychological thriller for $13.99, available.
  "The Girl with the Dragon Tattoo" by Stieg Larsson (2005) is a crime novel for $14.50, out of stock.`,
  
  `Book collection:
  "One Hundred Years of Solitude" - Gabriel García Márquez - 1967 - Magical realism - $15.50 - Available
  "The Kite Runner" - Khaled Hosseini - 2003 - Drama - $13.99 - In stock
  "Life of Pi" - Yann Martel - 2001 - Adventure - $12.99 - Out of stock`
];

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }

  const iterations = parseInt(process.env.BENCHMARK_ITERATIONS || '20');
  
  const config: BenchmarkConfig = {
    iterations,
    apiKey,
    inputTexts: sampleInputTexts
  };

  try {
    console.log(`Running benchmark with ${iterations} iterations per method...`);
    console.log(`Using ${sampleInputTexts.length} different input texts\n`);
    
    const results = await runComparison(config);
    printResults(results);
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `simple-object-results-${timestamp}.json`;
    
    await import('fs').then(fs => {
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`\nResults saved to: ${filename}`);
    });
    
  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}