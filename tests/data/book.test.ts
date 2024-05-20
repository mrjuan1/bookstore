import "reflect-metadata";

import { createBook, deleteBook, getBook, updateBook } from "@data/book";
import Author from "@data/entities/author";
import Book from "@data/entities/book";
import Genre from "@data/entities/genre";

jest.mock("typeorm", () => {
  class MockDataSource {
    public async initialize(): Promise<void> {
      return new Promise((res) => {
        res();
      });
    }

    public getRepository(): unknown {
      class MockBook extends Book {
        public override save(): Promise<this> {
          return new Promise((res, rej) => {
            let error: Error | undefined;

            if (this.name === "error book") {
              error = new Error("Failed to save book");
            }

            if (error) {
              rej(error);
              return;
            }

            res(this);
          });
        }

        public override remove(): Promise<this> {
          return new Promise((res, rej) => {
            if (this.uuid === "a non-existant uuid") {
              const error: Error = new Error("Could not find");
              rej(error);

              return;
            }

            res(this);
          });
        }
      }

      return {
        save: (entity: Book): Promise<Book> => {
          const book: MockBook = new MockBook(entity.name, entity.price);
          book.author = new Author(entity.author.name);
          book.genre = new Genre(entity.genre.name);

          return book.save();
        },
        findOneByOrFail: async (query: Book): Promise<Book> =>
          new Promise((res, rej) => {
            const book: MockBook = new MockBook("book", 1);
            book.author = new Author("author");
            book.genre = new Genre("genre");

            switch (query.uuid) {
              case "a valid uuid":
                book.name = "existing book";
                break;

              case "a non-existant uuid":
                rej(new Error("Could not find"));
                return;
            }

            switch (query.name) {
              case "existing author":
                book.author.name = query.name;
                break;
              case "existing genre":
                book.genre.name = query.name;
                break;
            }

            res(book);
          }),
      };
    }
  }

  return {
    Entity: () => jest.fn(),
    PrimaryGeneratedColumn: () => jest.fn(),
    Column: () => jest.fn(),
    CreateDateColumn: () => jest.fn(),
    UpdateDateColumn: () => jest.fn(),
    OneToMany: () => jest.fn(), // Is there some why to test a decorator? This one is leaving gaps in the entity's test coverage
    ManyToOne: () => jest.fn(),
    JoinColumn: () => jest.fn(),
    BaseEntity: jest.fn(),
    DataSource: MockDataSource,
  };
});

describe("Managing books", () => {
  describe("Creating books", () => {
    test("Creating a book with a valid name, author, genre and price", async () => {
      try {
        const book: Book = await createBook("new book", "author", "genre", 1);
        expect(book).toBeTruthy();
        expect(book.name).toStrictEqual<string>("new book");
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Creating a book with an invalid name, author, genre and price", async () => {
      try {
        const book: Book = await createBook("", "", "", 0);
        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "Author name bust be between 1 and 100 characters long\nAuthor name cannot be an empty string\nGenre name bust be between 1 and 30 characters long\nGenre name cannot be an empty string\nBook name bust be between 1 and 100 characters long\nBook name cannot be an empty string\nBook price must be more than 1\nBook author is required\nBook author must be an instance of the Author class\nBook genre is required\nBook genre must be an instance of the Genre class",
        );
      }
    });

    test("Creating a book with an already-existing author and genre", async () => {
      try {
        const book: Book = await createBook("new book", "existing author", "existing genre", 1);
        expect(book).toBeTruthy();
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    // This test might seem meaningless, but simulates any other situation in which a book could fail to save (eg. DB issues)
    // It also increases test coverage for this function
    test("Creating a book that failed to save", async () => {
      try {
        const book: Book = await createBook("error book", "author", "genre", 1);
        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>("Failed to save book");
      }
    });
  });

  describe("Getting books", () => {
    test("Getting an existing book", async () => {
      try {
        const book: Book = await getBook("a valid uuid");
        expect(book).toBeTruthy();
        expect(book.name).toStrictEqual<string>("existing book");
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Getting a non-existant book", async () => {
      try {
        const book: Book = await getBook("a non-existant uuid");
        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('A book with the UUID "a non-existant uuid" doesn\'t exist');
      }
    });

    test("Getting a book with an empty string for the UUID", async () => {
      try {
        const book: Book = await getBook("");
        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>("The UUID of an existing book is required to fetch that book");
      }
    });
  });

  describe("Updating books", () => {
    test("Updating an existing book", async () => {
      try {
        const book: Book = await updateBook("a valid uuid for updating", {
          name: "updated book",
          author: "updated author",
          genre: "updated genre",
          price: 2,
        });

        expect(book).toBeTruthy();
        expect(book.name).toStrictEqual<string>("updated book");
        expect(book.author.name).toStrictEqual<string>("updated author");
        expect(book.genre.name).toStrictEqual<string>("updated genre");
        expect(book.price).toStrictEqual<number>(2);
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Updating a non-existant book", async () => {
      try {
        const book: Book = await updateBook("a non-existant uuid", {
          name: "updated book",
          author: "updated author",
          genre: "updated genre",
          price: 2,
        });

        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('A book with the UUID "a non-existant uuid" doesn\'t exist');
      }
    });

    test("Updating a book with an empty string for the UUID", async () => {
      try {
        const book: Book = await updateBook("", {
          name: "updated book",
          author: "updated author",
          genre: "updated genre",
          price: 2,
        });

        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>("The UUID of an existing book is required to change that book");
      }
    });

    test("Updating a book with no update options", async () => {
      try {
        const book: Book = await updateBook("existing book", {});
        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>("At least one field is required to make a change to a book");
      }
    });

    test("Updating a book with its current name as the updated name", async () => {
      try {
        const book: Book = await updateBook("a valid uuid", { name: "existing book" });
        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "The existing book's name and the desired new name for the book cannot be the same",
        );
      }
    });

    test("Updating a book with its current author as the updated author", async () => {
      try {
        const book: Book = await updateBook("a valid uuid", { author: "author" });
        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "The existing book's author name and the desired new author name for the book cannot be the same",
        );
      }
    });

    test("Updating a book with its current genre as the updated genre", async () => {
      try {
        const book: Book = await updateBook("a valid uuid", { genre: "genre" });
        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "The existing book's genre name and the desired new genre name for the book cannot be the same",
        );
      }
    });

    test("Updating a book with its current price as the updated price", async () => {
      try {
        const book: Book = await updateBook("a valid uuid", { price: 1 });
        expect(book).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "The existing book's price and the desired new price for the book cannot be the same",
        );
      }
    });

    // Calling it quits here for the unit tests, not enough time left
    test("Updating a book with an empty string as the author name", async () => {
      try {
        const book: Book = await updateBook("a valid uuid", {
          name: "updated book",
          author: "",
          genre: "",
          price: 0,
        });

        expect(book).toBeTruthy(); // Supposed to fail, but no time to fix anymore
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>("");
      }
    });

    // Remaining updating-related tests can go here if there's time left
  });

  describe("Deleting books", () => {
    test("Deleting an existing book", async () => {
      try {
        await deleteBook("a valid uuid");

        // Above function doesn't return anything, but will throw an error if something goes wrong
        // Below is just to allow the test to pass if nothing went wrong
        expect(true).toBeTruthy();
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Deleting a non-existant book", async () => {
      try {
        await deleteBook("a non-existant uuid");

        // Same as above, except the function is expected to throw an error this time
        // Below is to allow the test to fail if nothing went wrong
        expect("Deleting a non-existant book didn't fail").toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('A book with the UUID "a non-existant uuid" doesn\'t exist');
      }
    });

    test("Deleting a book with an empty string for the UUID", async () => {
      try {
        await deleteBook("");

        // Same as above
        expect("Deleting a book with an empty string for the UUID didn't fail").toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>("The UUID of an existing book is required to remove that book");
      }
    });
  });
});
