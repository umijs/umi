export function printHelp() {
  console.log(`
Usage: umi-copilot [message]

Options:
  --token     OpenAI API key
  --proxy-url Proxy URL for OpenAI API
  --cwd       Working directory
  --timeout   Timeout for OpenAI API, Default: 20000
  --help      Show help

Examples:
  $ umi-copilot "I want to"

    `);
}
