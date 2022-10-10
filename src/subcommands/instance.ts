import { Command } from "commander";
import { lightsail } from "../clients";
import chalk from "chalk";
import { renderTable } from "../lib/renderTable";

const hardwareLine = (hardware: any) => {
  if (!hardware) return "";

  let line = `${hardware.cpuCount} vCPU`;
  line += `, ${hardware.ramSizeInGb} RAM`;
  for (const disk of hardware.disks || []) {
    line += `, ${disk.sizeInGb} GB disk`;
  }
  return line;
};

const instanceSubcommands = new Command().name("instance");

instanceSubcommands
  .command("get <instanceName>")
  .description("Detailed information about an instance")
  .action(async (instaceName, command) => {
    try {
      const { instance } = await lightsail.getInstance({
        instanceName: instaceName,
      });
      if (!instance) return console.log(chalk`{red Error:} Instance not found`);

      console.log(chalk`
{bold ${instance.name?.padEnd(50)}} Private IP: ${instance.privateIpAddress}
{gray ${hardwareLine(instance.hardware).padEnd(50)}} Public IP:  ${
        instance.publicIpAddress
      }
${instance.blueprintName}`);
      if (instance.networking?.ports) {
        renderTable(
          instance.networking.ports.map((port) => ({
            Protocol: port.protocol?.toUpperCase(),
            "Port(s)":
              port.fromPort != port.toPort
                ? `${port.fromPort} -> ${port.toPort}`
                : port.fromPort?.toString(),
            "Whitelisted from":
              port.accessFrom == "Custom"
                ? `Custom ${port.cidrs?.join(", ")}`
                : port.accessFrom,
          })),
          { Protocol: 1, "Port(s)": 1, "Whitelisted from": 1 },
          "Ports"
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name == "DoesNotExist") {
        console.log(chalk`{red Error:} Instance not found`);
      }
    }
  });

instanceSubcommands
  .command("add-port")
  .description("Adds port a firewall")
  .option("-f, --from-port <fromPort>", "From port", parseInt)
  .option("-t, --to-port [toPort]", "To port", parseInt)
  .option("-p, --protocol [protocol]", "Protocol to use TCP\\UDP ", "tcp")
  .option(
    "-c, --cidrs <cidrs>",
    "White listed IPs in CIDR notation",
    (v, prev: any[]) => [...prev, v],
    ["0.0.0.0/0"]
  )
  .argument("<instanceName>", "Instance to add port to")
  .action(async (instanceName: string, options) => {
    try {
      await lightsail.openInstancePublicPorts({
        instanceName,
        portInfo: options,
      });
      console.log(`Added port ${options.fromPort}/${options.protocol}`);
    } catch (error) {
      console.log(error);
    }
  });

instanceSubcommands
  .command("remove-port")
  .description("Removes port a firewall")
  .option("-f, --from-port <fromPort>", "From port", parseInt)
  .option("-t, --to-port [toPort]", "To port", parseInt)
  .option("-p, --protocol [protocol]", "Protocol to use TCP\\UDP ", "tcp")
  .argument("<instanceName>", "Instance to remove port from")
  .action(async (instanceName: string, options) => {
    try {
      await lightsail.closeInstancePublicPorts({
        instanceName,
        portInfo: options,
      });
      console.log(`Removed port ${options.fromPort}/${options.protocol}`);
    } catch (error) {
      console.log(error);
    }
  });

export default instanceSubcommands;
