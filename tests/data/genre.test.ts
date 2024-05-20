import "reflect-metadata";

import Genre from "@data/entities/genre";
import { createGenre, deleteGenre, getGenre, updateGenre } from "@data/genre";

jest.mock("typeorm", () => {
  class MockDataSource {
    public async initialize(): Promise<void> {
      return new Promise((res) => {
        res();
      });
    }

    public getRepository(): unknown {
      class MockGenre extends Genre {
        public override async save(): Promise<this> {
          return new Promise((res, rej) => {
            let error: Error | undefined;

            if (this.name === "existing genre" || this.name === "another existing genre") {
              error = new Error("already exists.");
            }

            if (this.name === "non-existant genre") {
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
            if (this.name === "non-existant genre") {
              const error: Error = new Error("Could not find");
              rej(error);

              return;
            }

            res(this);
          });
        }
      }

      const genre: MockGenre = new MockGenre("genre");

      return {
        save: async (entity: Genre): Promise<Genre> => {
          genre.name = entity.name;
          return genre.save();
        },
        findOneByOrFail: async (query: Genre): Promise<Genre> =>
          new Promise((res, rej) => {
            if (query.name === "non-existant genre") {
              const error: Error = new Error("Could not find");
              rej(error);

              return;
            }

            genre.name = query.name;
            res(genre);
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

describe("Managing genres", () => {
  describe("Creating genres", () => {
    test("Creating a genre with a valid name", async () => {
      try {
        const genre: Genre = await createGenre("new genre");
        expect(genre).toBeTruthy();
        expect(genre.name).toStrictEqual<string>("new genre");
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Creating a genre with a name that already exists", async () => {
      try {
        const genre: Genre = await createGenre("existing genre");
        expect(genre).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('A genre with the name "existing genre" already exists');
      }
    });

    test("Creating a genre with a blank name", async () => {
      try {
        const genre: Genre = await createGenre("");
        expect(genre).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "Genre name bust be between 1 and 30 characters long\nGenre name cannot be an empty string",
        );
      }
    });
  });

  describe("Getting genres", () => {
    test("Getting an existing genre", async () => {
      try {
        const genre: Genre = await getGenre("existing genre");
        expect(genre).toBeTruthy();
        expect(genre.name).toStrictEqual<string>("existing genre");
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Getting a non-existant genre", async () => {
      try {
        const genre: Genre = await getGenre("non-existant genre");
        expect(genre).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('A genre with the name "non-existant genre" doesn\'t exist');
      }
    });

    test("Getting a genre with an empty string as the name", async () => {
      try {
        const genre: Genre = await getGenre("");
        expect(genre).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>("A name of an existing genre is required to fetch that genre");
      }
    });
  });

  describe("Updating genres", () => {
    test("Updating an existing genre", async () => {
      try {
        const genre: Genre = await updateGenre("existing genre", "updated genre");
        expect(genre).toBeTruthy();
        expect(genre.name).toStrictEqual<string>("updated genre");
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Updating a non-existant genre", async () => {
      try {
        const genre: Genre = await updateGenre("non-existant genre", "updated genre");
        expect(genre).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('A genre with the name "non-existant genre" doesn\'t exist');
      }
    });

    test("Updating to a genre that already exists", async () => {
      try {
        const genre: Genre = await updateGenre("existing genre", "another existing genre");
        expect(genre).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          'A genre with the name "another existing genre" already exists',
        );
      }
    });

    test("Updating a genre with an empty string as the name", async () => {
      try {
        const genre: Genre = await updateGenre("", "updated genre");
        expect(genre).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>("A name of an existing genre is required to change that genre");
      }
    });

    test("Updating a genre with an empty string as the updated name", async () => {
      try {
        const genre: Genre = await updateGenre("existing genre", "");
        expect(genre).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "Genre name bust be between 1 and 30 characters long\nGenre name cannot be an empty string",
        );
      }
    });

    test("Updating a genre with an its current name as the updated name", async () => {
      try {
        const genre: Genre = await updateGenre("genre", "genre");
        expect(genre).toBeFalsy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>(
          "The existing genre's name and the desired new name for the genre cannot be the same",
        );
      }
    });
  });

  describe("Deleting genres", () => {
    test("Deleting an existing genre", async () => {
      try {
        await deleteGenre("existing genre");

        // Above function doesn't return anything, but will throw an error if something goes wrong
        // Below is just to allow the test to pass if nothing went wrong
        expect(true).toBeTruthy();
      } catch (error: unknown) {
        expect(error).toBeFalsy();
      }
    });

    test("Deleting a non-existant genre", async () => {
      try {
        await deleteGenre("non-existant genre");

        // Same as above, except the function is expected to throw an error this time
        // Below is to allow the test to fail if nothing went wrong
        expect("Deleting a non-existant genre didn't fail").toBeTruthy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>('A genre with the name "non-existant genre" doesn\'t exist');
      }
    });

    test("Deleting a genre with an empty string as the name", async () => {
      try {
        await deleteGenre("");

        // Same as above
        expect("Deleting a genre with an empty string as the name didn't fail").toBeTruthy();
      } catch (error: unknown) {
        expect(error).toBeTruthy();

        const castError: Error = error as Error;
        expect(castError.message).toStrictEqual<string>("A name of an existing genre is required to remove that genre");
      }
    });
  });
});
