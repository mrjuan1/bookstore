import "reflect-metadata";

import { dataSource } from "@data/data-access";
import Author from "@data/entities/author";
import { createAuthor, deleteAuthor, getAuthor, updateAuthor } from "@data/author";

const main = async (): Promise<void> => {
  try {
    const createdAuthor: Author = await createAuthor("Some author");
    console.log(createdAuthor);

    const updatedAuthor: Author = await updateAuthor("Some author", "Some other author");
    console.log(updatedAuthor);

    await deleteAuthor("Some other author");

    const author: Author = await getAuthor("Some other author");
    console.log(author);

    await dataSource.destroy();
  } catch (error: unknown) {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    throw error;
  }
};

main().catch((error: unknown) => {
  const castError: Error = error as Error;
  console.error("An error has occurred:", castError.message);

  process.exit(1);
});
