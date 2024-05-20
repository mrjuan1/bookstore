import "reflect-metadata";

import { createAuthor, deleteAuthor, getAuthor, updateAuthor } from "@data/author";
import Author from "@data/entities/author";

jest.mock("typeorm", () => {
  class MockDataSource {
    public async initialize(): Promise<void> {
      return new Promise((res) => {
        res();
      });
    }

    public getRepository(): unknown {
      class MockAuthor extends Author {
        public override async save(): Promise<this> {
          return new Promise((res, rej) => {
            let error: Error | undefined;

            if (this.name === "existing author" || this.name === "another existing author") {
              error = new Error("already exists.");
            }

            if (this.name === "non-existant author") {
              error = new Error("Could not find");
            }

            if (error) {
              rej(error);
              return;
            }

            res(this);
          });
        }

        public override async remove(): Promise<this> {
          return new Promise((res, rej) => {
            if (this.name === "non-existant author") {
              const error: Error = new Error("Could not find");
              rej(error);

              return;
            }

            res(this);
          });
        }
      }

      const author: MockAuthor = new MockAuthor("author");

      return {
        save: async (entity: Author): Promise<Author> => {
          author.name = entity.name;
          return author.save();
        },
        findOneByOrFail: async (query: Author): Promise<Author> =>
          new Promise((res, rej) => {
            if (query.name === "non-existant author") {
              const error: Error = new Error("Could not find");
              rej(error);

              return;
            }

            author.name = query.name;
            res(author);
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

describe("Managing authors", () => {
  describe("Creating authors", () => {
    test("Creating an author with a valid name", async () => {
      try {
        const author: Author = await createAuthor("new author");
        expect(author).toBeTruthy();
        expect(author.name).toStrictEqual<string>("new author");
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Creating an author with a name that already exists", async () => {
      try {
        const author: Author = await createAuthor("existing author");
        expect(author).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('An author with the name "existing author" already exists');
      }
    });

    test("Creating an author with a blank name", async () => {
      try {
        const author: Author = await createAuthor("");
        expect(author).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "Author name bust be between 1 and 100 characters long\nAuthor name cannot be an empty string",
        );
      }
    });
  });

  describe("Getting authors", () => {
    test("Getting an existing author", async () => {
      try {
        const author: Author = await getAuthor("existing author");
        expect(author).toBeTruthy();
        expect(author.name).toStrictEqual<string>("existing author");
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Getting a non-existant author", async () => {
      try {
        const author: Author = await getAuthor("non-existant author");
        expect(author).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('An author with the name "non-existant author" doesn\'t exist');
      }
    });

    test("Getting an author with an empty string as the name", async () => {
      try {
        const author: Author = await getAuthor("");
        expect(author).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "A name of an existing author is required to fetch that author",
        );
      }
    });
  });

  describe("Updating authors", () => {
    test("Updating an existing author", async () => {
      try {
        const author: Author = await updateAuthor("existing author", "updated author");
        expect(author).toBeTruthy();
        expect(author.name).toStrictEqual<string>("updated author");
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Updating a non-existant author", async () => {
      try {
        const author: Author = await updateAuthor("non-existant author", "updated author");
        expect(author).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('An author with the name "non-existant author" doesn\'t exist');
      }
    });

    test("Updating to an author that already exists", async () => {
      try {
        const author: Author = await updateAuthor("existing author", "another existing author");
        expect(author).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          'An author with the name "another existing author" already exists',
        );
      }
    });

    test("Updating an author with an empty string as the name", async () => {
      try {
        const author: Author = await updateAuthor("", "updated author");
        expect(author).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "A name of an existing author is required to change that author",
        );
      }
    });

    test("Updating an author with an empty string as the updated name", async () => {
      try {
        const author: Author = await updateAuthor("existing author", "");
        expect(author).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "Author name bust be between 1 and 100 characters long\nAuthor name cannot be an empty string",
        );
      }
    });

    test("Updating an author with an its current name as the updated name", async () => {
      try {
        const author: Author = await updateAuthor("author", "author");
        expect(author).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "The existing author's name and the desired new name for the author cannot be the same",
        );
      }
    });
  });

  describe("Deleting authors", () => {
    test("Deleting an existing author", async () => {
      try {
        await deleteAuthor("existing author");

        // Above function doesn't return anything, but will throw an error if something goes wrong
        // Below is just to allow the test to pass if nothing went wrong
        expect(true).toBeTruthy();
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Deleting a non-existant author", async () => {
      try {
        await deleteAuthor("non-existant author");

        // Same as above, except the function is expected to throw an error this time
        // Below is to allow the test to fail if nothing went wrong
        expect("Deleting a non-existant author didn't fail").toBeTruthy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('An author with the name "non-existant author" doesn\'t exist');
      }
    });

    test("Deleting an author with an empty string as the name", async () => {
      try {
        await deleteAuthor("");

        // Same as above
        expect("Deleting an author with an empty string as the name didn't fail").toBeTruthy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "A name of an existing author is required to remove that author",
        );
      }
    });
  });
});
