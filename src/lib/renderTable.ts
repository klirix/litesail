import chalk from "chalk";

export const renderTable = <T extends Record<string, string | undefined>>(
  list: T[],
  options: Record<keyof T, NonNullable<any>>,
  title?: string
) => {
  const titles = Object.keys(options);
  const lengths = Object.keys(options).reduce(
    (acc, key) => ({
      ...acc,
      [key]: list.reduce(
        (acc, item) =>
          Math.max(item[key]?.length || 0, acc, key.length + 1) + 1,
        0
      ),
    }),
    {} as Record<keyof T, number>
  );
  if (title) console.log(`${title}:`);
  console.log(
    titles.reduce(
      (acc, title) =>
        acc +
        chalk.bold(title.padEnd(Math.max(lengths[title], title.length + 1))),
      ""
    )
  );
  for (const item of list) {
    console.log(
      Object.entries(item).reduce(
        (acc, [key, value]) =>
          acc + (key in options ? (value || "").padEnd(lengths[key]) : ""),
        ""
      )
    );
  }
};
