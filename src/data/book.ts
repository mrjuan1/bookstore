import { getAuthor } from "@data/author";
import { DataRepositories, getDataRepositories } from "@data/data-access";
import Author from "@data/entities/author";
import Book from "@data/entities/book";
import Genre from "@data/entities/genre";
import { getGenre } from "@data/genre";
import { handleQueryError } from "@utils/query-error";
import { FieldError, getValidationErrors } from "@utils/validation-errors";

export interface BookUpdateOptions {
  name?: string;
  author?: string;
  genre?: string;
  price?: number;
}

const joinFieldErrors = (fieldErrors: FieldError[]): string => {
  const joinedErrorStrings: string[] = fieldErrors.map<string>((error: FieldError) => error.errors.join("\n"));
  return joinedErrorStrings.join("\n");
};

// Sadly, it is possible to have duplicate books in the books table. Not enough time to cater for this right now :(
export const createBook = async (name: string, authorName: string, genreName: string, price: number): Promise<Book> => {
  try {
    const book: Book = new Book(name, price);

    const author: Author = new Author(authorName);
    let errors: FieldError[] | null = await getValidationErrors(author);
    let errorString: string = "";
    if (errors) {
      errorString += `${joinFieldErrors(errors)}\n`;
    } else {
      book.author = author;
    }

    const genre: Genre = new Genre(genreName);
    errors = await getValidationErrors(genre);
    if (errors) {
      errorString += `${joinFieldErrors(errors)}\n`;
    } else {
      book.genre = genre;
    }

    errors = await getValidationErrors(book);
    if (errors) {
      errorString += joinFieldErrors(errors);
      throw new Error(errorString);
    }

    const dataRepos: DataRepositories = await getDataRepositories();

    let bookSaved: boolean = false;
    while (!bookSaved) {
      try {
        await dataRepos.book.save(book);
        bookSaved = true;
      } catch (error: unknown) {
        const handledError: unknown = handleQueryError(error);
        const castError: Error = handledError as Error;

        if (castError.message.endsWith("already exists.")) {
          if (castError.message.startsWith("authors")) {
            book.author = await getAuthor(authorName);
          } else if (castError.message.startsWith("genres")) {
            book.genre = await getGenre(genreName);
          }
        } else {
          throw handledError;
        }
      }
    }

    return book;
  } catch (error: unknown) {
    throw handleQueryError(error);
  }
};

// Getting by UUID because I didn't think of using ISBN's originally and there's not enough time to add that now :(
export const getBook = async (uuid: string): Promise<Book> => {
  try {
    if (!uuid) {
      throw new Error("The UUID of an existing book is required to fetch that book");
    }

    const dataRepos: DataRepositories = await getDataRepositories();
    const book: Book = await dataRepos.book.findOneByOrFail({ uuid });

    return book;
  } catch (error: unknown) {
    const handledError: unknown = handleQueryError(error);
    const castError: Error = handledError as Error;

    if (castError.message.startsWith("Could not find")) {
      throw new Error(`A book with the UUID "${uuid}" doesn't exist`);
    }

    throw handledError;
  }
};

export const updateBook = async (uuid: string, updateOptions: BookUpdateOptions): Promise<Book> => {
  try {
    if (!uuid) {
      throw new Error("The UUID of an existing book is required to change that book");
    }

    if (!updateOptions.name && !updateOptions.author && !updateOptions.genre && !updateOptions.price) {
      throw new Error("At least one field is required to make a change to a book");
    }

    const book: Book = await getBook(uuid);

    if (updateOptions.name) {
      if (updateOptions.name === book.name) {
        throw new Error("The existing book's name and the desired new name for the book cannot be the same");
      }

      book.name = updateOptions.name;
    }

    let errors: FieldError[] | null;
    let errorString: string = "";

    if (updateOptions.author || updateOptions.author === "") {
      if (updateOptions.author === book.author.name) {
        throw new Error(
          "The existing book's author name and the desired new author name for the book cannot be the same",
        );
      }

      const author: Author = new Author(updateOptions.author);
      errors = await getValidationErrors(author);
      if (errors) {
        errorString += `${joinFieldErrors(errors)}\n`;
      } else {
        book.author = author;
      }
    }

    if (updateOptions.genre || updateOptions.genre === "") {
      if (updateOptions.genre === book.genre.name) {
        throw new Error(
          "The existing book's genre name and the desired new genre name for the book cannot be the same",
        );
      }

      const genre: Genre = new Genre(updateOptions.genre);
      errors = await getValidationErrors(genre);
      if (errors) {
        errorString += `${joinFieldErrors(errors)}\n`;
      } else {
        book.genre = genre;
      }
    }

    if (updateOptions.price) {
      if (updateOptions.price === book.price) {
        throw new Error("The existing book's price and the desired new price for the book cannot be the same");
      }

      book.price = updateOptions.price;
    }

    errors = await getValidationErrors(book);
    if (errors) {
      errorString += joinFieldErrors(errors);
      throw new Error(errorString);
    }

    let bookSaved: boolean = false;
    while (!bookSaved) {
      try {
        await book.save();
        bookSaved = true;
      } catch (error: unknown) {
        const handledError: unknown = handleQueryError(error);
        const castError: Error = handledError as Error;

        if (castError.message.endsWith("already exists.")) {
          if (updateOptions.author && castError.message.startsWith("authors")) {
            book.author = await getAuthor(updateOptions.author);
          } else if (updateOptions.genre && castError.message.startsWith("genres")) {
            book.genre = await getGenre(updateOptions.genre);
          }
        } else {
          throw handledError;
        }
      }
    }

    return book;
  } catch (error: unknown) {
    throw handleQueryError(error);
  }
};

export const deleteBook = async (uuid: string): Promise<void> => {
  try {
    if (!uuid) {
      throw new Error("The UUID of an existing book is required to remove that book");
    }

    const book: Book = await getBook(uuid);
    await book.remove();
  } catch (error: unknown) {
    throw handleQueryError(error);
  }
};
