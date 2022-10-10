import { Command } from "commander";
import { lightsail, region } from "../clients";
import { renderTable } from "../lib/renderTable";
import { readFileSync } from "fs";
import chalk from "chalk";

const instancesSubcommand = new Command().name("instances");

instancesSubcommand
  .command("ls")
  .description("List instances")
  .action(async () => {
    const { instances = [] } = await lightsail.getInstances({});
    renderTable(
      instances.map((x) => ({
        Name: x.name,
        Status: x.state?.name,
        Bundle: x.bundleId,
        "Public IP": x.publicIpAddress,
        "Private IP": x.privateIpAddress,
      })),
      {
        Name: 1,
        Status: 1,
        Bundle: 1,
        "Public IP": 1,
        "Private IP": 1,
      }
    );
  });

instancesSubcommand
  .command("rm <instanceName>")
  .description("Remove instance")
  .action(async (instanceName: string) => {
    await lightsail.deleteInstance({ instanceName });
    console.log(`Instance ${instanceName} removed`);
  });

instancesSubcommand
  .command("create <instanceName>")
  .description("Remove instance")
  .option(
    "--blueprint-id <blueprint>",
    `Blueprint to use, check ${chalk.bold(`lightsail blueprints`)} for a list`
  )
  .option(
    "--bundle-id <bunlde>",
    `Price level to use, check ${chalk.bold(`lightsail bundles`)} for a list`
  )
  .option(
    "--key-pair-name [key]",
    "Key pair to use, if not provided used default for region"
  )
  .option(
    "--startup-script [scriptFile]",
    "Use this file to initialize the instance"
  )
  .option("--attach-static", "Automatically attach a static IP")
  .option("--snapshot [snapshot]", "Create instance from snapshot")
  .option("--region [region]", "Region to create instance in", region)
  .action(async (instanceName: string, options) => {
    const { bundleId, blueprintId, region } = options;
    const commonOptions = {
      instanceNames: [instanceName],
      bundleId,
      availabilityZone: region,
      ipAddressType: "dualstack",
      userData: options.startupScript
        ? readFileSync(options.startupScript).toString("utf-8")
        : undefined,
    };
    if (options.snapshot) {
      await lightsail.createInstancesFromSnapshot({
        instanceSnapshotName: options.snapshot,
        ...commonOptions,
      });
    } else {
      await lightsail.createInstances({
        blueprintId,
        ...commonOptions,
      });
    }
    console.log(`Instance ${instanceName} removed`);
  });

instancesSubcommand.command;

export default instancesSubcommand;
