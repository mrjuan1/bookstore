import "reflect-metadata";

import { addAuthor } from "@data/author";
import { dataSource } from "@data/data-access";
import Author from "@data/entities/author";

const main = async (): Promise<void> => {
  const author: Author = await addAuthor("Mister Book Person");
  console.log(author);

  await dataSource.destroy();
};

main().catch((error: unknown) => {
  console.error("An error has occurred:", error);
  process.exit(1);
});
