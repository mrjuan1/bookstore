import Author from "@data/entities/author";
import Book from "@data/entities/book";
import Genre from "@data/entities/genre";
import { generateDataSource } from "@utils/data-source";
import { DataSource, Repository } from "typeorm";

type GetDataRepositoriesFunc = () => Promise<DataRepositories>;

export interface DataRepositories {
  author: Repository<Author>;
  genre: Repository<Genre>;
  book: Repository<Book>;
}

export const dataSource: DataSource = generateDataSource("API");

export const getDataRepositories: GetDataRepositoriesFunc = async (): Promise<DataRepositories> => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  return {
    author: dataSource.getRepository(Author),
    genre: dataSource.getRepository(Genre),
    book: dataSource.getRepository(Book),
  };
};
