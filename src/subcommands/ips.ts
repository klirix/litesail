import { Command } from "commander";
import { lightsail } from "../clients";
import { renderTable } from "../lib/renderTable";

export const ipsCommands = new Command().name("ips");
ipsCommands
  .command("ls")
  .description("List static ips")
  .action(async () => {
    const { staticIps = [] } = await lightsail.getStaticIps({});
    console.log(staticIps.filter((x) => !x.isAttached));

    if (staticIps.some((x) => x.isAttached))
      renderTable(
        staticIps
          .filter((x) => x.isAttached)
          .map((ip) => ({
            Name: ip.name,
            IP: ip.ipAddress,
            "Instance Name": ip.attachedTo,
          })),
        { Name: 1, IP: 1, "Instance Name": 1 },
        "Attached IPs"
      );
    if (staticIps.some((x) => !x.isAttached)) {
      console.log("");
      renderTable(
        staticIps
          .filter((x) => !x.isAttached)
          .map((ip) => ({
            Name: ip.name,
            IP: ip.ipAddress,
          })),
        { Name: 1, IP: 1 },
        "Free IPs"
      );
    }
  });
ipsCommands.command("detach <ip-name>").action(async (staticIpName: string) => {
  await lightsail.detachStaticIp({ staticIpName });
  console.log("Static IP successfully attached!");
});

ipsCommands.command("rm <ip-name>").action(async (staticIpName) => {
  await lightsail.releaseStaticIp({ staticIpName });
  console.log("Static IP successfully released!");
});

ipsCommands.command("new <ip-name>").action(async (staticIpName) => {
  await lightsail.allocateStaticIp({ staticIpName });
  console.log("Static IP successfully allocated!");
});
