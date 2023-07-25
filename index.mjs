import { Cluster } from "playwright-cluster";
import { checkAppointmentAvailability } from "./registration-bot.mjs";
import { data } from "./data.mjs";

export const execute = async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: data.length,
  });

  await cluster.task(async ({ data }) => {
    checkAppointmentAvailability(data);
  });

  data.forEach((d) => cluster.queue(d));

  await cluster.idle();
  await cluster.close();
};

execute();
