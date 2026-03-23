import "dotenv/config";
import { locusService } from "./locus-service.js";
import chalk from "chalk";

async function main() {
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(
    chalk.bold.cyan("🎁 Aegis Locus: Requesting Hackathon Credits..."),
  );
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

  const email = process.env.LOCUS_EMAIL || "nasihudeen04@gmail.com";
  const reason =
    "Building Aegis Confidential Concierge at The Synthesis Hackathon - integrating Checkout, Search, and Audit Trail.";
  // 0x5cd6edd33a85dc567ea28b07995019ae0dbf586e6ce9c573ebedc73475aa0cce
  try {
    console.log(chalk.dim(`📧 Requesting $5 USDC for: ${email}`));
    const result = await locusService.requestCredits(email, reason);
    console.log(chalk.green("\n✅ Request Submitted Successfully!"));
    console.log(chalk.white(`Status: ${result.status || "Pending"}`));
    console.log(chalk.yellow("\nNext Steps:"));
    console.log(chalk.white("1. Check your email for the redemption code."));
    console.log(chalk.white("2. Go to app.paywithlocus.com to redeem."));
    console.log(
      chalk.white(
        "3. Once redeemed, your Agent can perform live Locus searches and checkouts!",
      ),
    );
  } catch (err: any) {
    console.error(chalk.red(`\n❌ Request Failed: ${err.message}`));
  }
}

main();
