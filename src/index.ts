import "reflect-metadata";

import { DataRepositories, dataSource, getDataRepositories } from "@data/data-access";
import Author from "@data/entities/author";
import Book from "@data/entities/book";
import Genre from "@data/entities/genre";

const main = async (): Promise<void> => {
  const repos: DataRepositories = await getDataRepositories();

  const authors: Author[] = await repos.author.find();
  // await authors[0].books;
  console.log(authors);

  const genres: Genre[] = await repos.genre.find();
  // await genres[0].books;
  console.log(genres);

  const books: Book[] = await repos.book.find();
  console.log(books);

  await dataSource.destroy();
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
