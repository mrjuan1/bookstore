import "reflect-metadata";

import { createBook } from "@data/book";
import { DataRepositories, dataSource, getDataRepositories } from "@data/data-access";
import Book from "@data/entities/book";

const main = async (): Promise<void> => {
  try {
    const createdBook: Book = await createBook("Some book", "Some author", "Some genre", 10000);
    console.log(createdBook);

    const dataRepos: DataRepositories = await getDataRepositories();

    const books: Book[] = await dataRepos.book.find();
    console.log(books);

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
