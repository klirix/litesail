import { Lightsail } from "@aws-sdk/client-lightsail";
import { env } from "process";

export const region = env.AWS_REGION;

export const lightsail = new Lightsail({ region });
