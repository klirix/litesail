import { Command } from "commander";
import manifest from "../package.json";
import { ipsCommands } from "./subcommands/ipsCommands";
import instanceSubcommands from "./subcommands/instance";
import instancesSubcommand from "./subcommands/instances";
import { lightsail } from "./clients";
import { renderTable } from "./lib/renderTable";

const app = new Command()
  .name("Litesail")
  .version(manifest.version)
  .description("CLI for easier Lightsail management");

app.addCommand(instancesSubcommand);
app.addCommand(instanceSubcommands);
app.addCommand(ipsCommands);

app
  .command("bundles")
  .option(
    `-p --platform [platform]`,
    "Platform to fetch bundles for (linux/windows)",
    "linux"
  )
  .action(async ({ platform }) => {
    const { bundles = [] } = await lightsail.getBundles({});
    renderTable(
      bundles
        .filter(
          (b) =>
            b.supportedPlatforms![0] ===
            (platform === "linux" ? "LINUX_UNIX" : "WINDOWS")
        )
        .map((x) => ({
          ID: x.bundleId,
          Price: `$${x.price}`,
          Name: x.name,
          Hardware: `${x.cpuCount} CPU, ${x.ramSizeInGb} RAM, ${x.diskSizeInGb} disk`,
          "Transfer/mo.": `${x.transferPerMonthInGb} GB`,
          "Power Level": x.power?.toString(),
        })),
      {
        ID: 1,
        Price: 1,
        Name: 1,
        Hardware: 1,
        "Transfer/mo.": 1,
        "Power Level": 1,
      }
    );
  });

app
  .command("blueprints")
  .option(
    `-p --platform [platform]`,
    "Platform to fetch bundles for (linux/windows)",
    "linux"
  )
  .description("Fetch available blueprints")
  .action(async (options) => {
    const { blueprints = [] } = await lightsail.getBlueprints({});
    const platform = options.platform === "linux" ? "LINUX_UNIX" : "WINDOWS";
    console.log(blueprints); // TODO: Maybe list blueprints properly?
  });

app.parse();
