import "reflect-metadata";

import { createBook } from "@data/book";
import Book from "@data/entities/book";

jest.mock("typeorm", () => {
  class MockDataSource {
    public async initialize(): Promise<void> {
      return new Promise((res) => {
        res();
      });
    }

    public getRepository(): unknown {
      // class MockBook extends Book {
      //   public override async save(): Promise<this> {
      //     return new Promise((res, rej) => {
      //       let error: Error | undefined;

      //       if (this.name === "existing book") {
      //         error = new Error("already exists.");
      //       }

      //       if (this.name === "non-existant book") {
      //         error = new Error("Could not find");
      //       }

      //       if (error) {
      //         rej(error);
      //         return;
      //       }

      //       res(this);
      //     });
      //   }

      //   public override async remove(): Promise<this> {
      //     return new Promise((res, rej) => {
      //       if (this.name === "non-existant book") {
      //         const error: Error = new Error("Could not find");
      //         rej(error);

      //         return;
      //       }

      //       res(this);
      //     });
      //   }
      // }

      // const book: MockBook = new MockBook("book", 1);

      return {
        save: (entity: Book): Promise<Book> => {
          return new Promise((res, rej) => {
            if (entity.name === "error book") {
              rej(Error("Failed to save book"));
              return;
            }

            if (entity.author.name === "existing author") {
              rej(Error("authors already exists."));
              return;
            }

            if (entity.genre.name === "existing genre") {
              rej(Error("genres already exists."));
              return;
            }
            // book.name = entity.name;
            // book.price = entity.price;

            // return book.save();
            res(entity);
          });
        },
        findOneByOrFail: async (query: { name: string }): Promise<unknown> =>
          new Promise((res, rej) => {
            if (query.name === "existing author" || query.name === "existing genre") {
              res({});
              return;
            }

            rej(new Error(`findOneByOrFail: ${JSON.stringify(query)}`));
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

  // describe("Getting books", () => {
  //   test("Getting an existing book", async () => {
  //     try {
  //       const book: Book = await getBook("existing book");
  //       expect(book).toBeTruthy();
  //       expect(book.name).toStrictEqual<string>("existing book");
  //     } catch (error: unknown) {
  //       expect(error).toBeFalsy();
  //     }
  //   });

  //   test("Getting a non-existant book", async () => {
  //     try {
  //       const book: Book = await getBook("non-existant book");
  //       expect(book).toBeFalsy();
  //     } catch (error: unknown) {
  //       expect(error).toBeTruthy();

  //       const castError: Error = error as Error;
  //       expect(castError.message).toStrictEqual<string>('A book with the name "non-existant book" doesn\'t exist');
  //     }
  //   });

  //   test("Getting a book with an empty string as the name", async () => {
  //     try {
  //       const book: Book = await getBook("");
  //       expect(book).toBeFalsy();
  //     } catch (error: unknown) {
  //       expect(error).toBeTruthy();

  //       const castError: Error = error as Error;
  //       expect(castError.message).toStrictEqual<string>("A name of an existing book is required to fetch that book");
  //     }
  //   });
  // });

  // describe("Updating books", () => {
  //   test("Updating an existing book", async () => {
  //     try {
  //       const book: Book = await updateBook("existing book", "updated book");
  //       expect(book).toBeTruthy();
  //       expect(book.name).toStrictEqual<string>("updated book");
  //     } catch (error: unknown) {
  //       expect(error).toBeFalsy();
  //     }
  //   });

  //   test("Updating a non-existant book", async () => {
  //     try {
  //       const book: Book = await updateBook("non-existant book", "updated book");
  //       expect(book).toBeFalsy();
  //     } catch (error: unknown) {
  //       expect(error).toBeTruthy();

  //       const castError: Error = error as Error;
  //       expect(castError.message).toStrictEqual<string>('A book with the name "non-existant book" doesn\'t exist');
  //     }
  //   });

  //   test("Updating to a book that already exists", async () => {
  //     try {
  //       const book: Book = await updateBook("existing book", "another existing book");
  //       expect(book).toBeFalsy();
  //     } catch (error: unknown) {
  //       expect(error).toBeTruthy();

  //       const castError: Error = error as Error;
  //       expect(castError.message).toStrictEqual<string>('A book with the name "another existing book" already exists');
  //     }
  //   });

  //   test("Updating a book with an empty string as the name", async () => {
  //     try {
  //       const book: Book = await updateBook("", "updated book");
  //       expect(book).toBeFalsy();
  //     } catch (error: unknown) {
  //       expect(error).toBeTruthy();

  //       const castError: Error = error as Error;
  //       expect(castError.message).toStrictEqual<string>("A name of an existing book is required to change that book");
  //     }
  //   });

  //   test("Updating a book with an empty string as the updated name", async () => {
  //     try {
  //       const book: Book = await updateBook("existing book", "");
  //       expect(book).toBeFalsy();
  //     } catch (error: unknown) {
  //       expect(error).toBeTruthy();

  //       const castError: Error = error as Error;
  //       expect(castError.message).toStrictEqual<string>(
  //         "Book name bust be between 1 and 30 characters long\nBook name cannot be an empty string",
  //       );
  //     }
  //   });

  //   test("Updating a book with an its current name as the updated name", async () => {
  //     try {
  //       const book: Book = await updateBook("book", "book");
  //       expect(book).toBeFalsy();
  //     } catch (error: unknown) {
  //       expect(error).toBeTruthy();

  //       const castError: Error = error as Error;
  //       expect(castError.message).toStrictEqual<string>(
  //         "The existing book's name and the desired new name for the book cannot be the same",
  //       );
  //     }
  //   });
  // });

  // describe("Deleting books", () => {
  //   test("Deleting an existing book", async () => {
  //     try {
  //       await deleteBook("existing book");

  //       // Above function doesn't return anything, but will throw an error if something goes wrong
  //       // Below is just to allow the test to pass if nothing went wrong
  //       expect(true).toBeTruthy();
  //     } catch (error: unknown) {
  //       expect(error).toBeFalsy();
  //     }
  //   });

  //   test("Deleting a non-existant book", async () => {
  //     try {
  //       await deleteBook("non-existant book");

  //       // Same as above, except the function is expected to throw an error this time
  //       // Below is to allow the test to fail if nothing went wrong
  //       expect("Deleting a non-existant book didn't fail").toBeTruthy();
  //     } catch (error: unknown) {
  //       expect(error).toBeTruthy();

  //       const castError: Error = error as Error;
  //       expect(castError.message).toStrictEqual<string>('A book with the name "non-existant book" doesn\'t exist');
  //     }
  //   });

  //   test("Deleting a book with an empty string as the name", async () => {
  //     try {
  //       await deleteBook("");

  //       // Same as above
  //       expect("Deleting a book with an empty string as the name didn't fail").toBeTruthy();
  //     } catch (error: unknown) {
  //       expect(error).toBeTruthy();

  //       const castError: Error = error as Error;
  //       expect(castError.message).toStrictEqual<string>("A name of an existing book is required to remove that book");
  //     }
  //   });
  // });
});
