import { getAuthor } from "@data/author";
import { DataRepositories, getDataRepositories } from "@data/data-access";
import Author from "@data/entities/author";
import Book from "@data/entities/book";
import Genre from "@data/entities/genre";
import { getGenre } from "@data/genre";
import { handleQueryError } from "@utils/query-error";
import { FieldError, getValidationErrors } from "@utils/validation-errors";

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
      errorString += joinFieldErrors(errors);
    } else {
      book.author = author;
    }

    const genre: Genre = new Genre(genreName);
    errors = await getValidationErrors(genre);
    if (errors) {
      errorString += `\n${joinFieldErrors(errors)}`;
    } else {
      book.genre = genre;
    }

    errors = await getValidationErrors(book);
    if (errors) {
      errorString += `\n${joinFieldErrors(errors)}`;
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

export const updateBook = async (existingName: string, newName: string): Promise<Book> => {
  try {
    if (!existingName) {
      throw new Error("A name of an existing book is required to change that book");
    }

    if (existingName === newName) {
      throw new Error("The existing book's name and the desired new name for the book cannot be the same");
    }

    const book: Book = await getBook(existingName);
    book.name = newName;

    const errors: FieldError[] | null = await getValidationErrors(book);
    if (errors) {
      throw new Error(joinFieldErrors(errors));
    }

    await book.save();

    return book;
  } catch (error: unknown) {
    const handledError: unknown = handleQueryError(error);
    const castError: Error = handledError as Error;

    if (castError.message.endsWith("already exists.")) {
      throw new Error(`A book with the name "${newName}" already exists`);
    }

    throw handledError;
  }
};

export const deleteBook = async (name: string): Promise<void> => {
  try {
    if (!name) {
      throw new Error("A name of an existing book is required to remove that book");
    }

    const book: Book = await getBook(name);
    await book.remove();
  } catch (error: unknown) {
    throw handleQueryError(error);
  }
};
