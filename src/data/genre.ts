import { DataRepositories, getDataRepositories } from "@data/data-access";
import Genre from "@data/entities/genre";
import { handleQueryError } from "@utils/query-error";
import { FieldError, getValidationErrors } from "@utils/validation-errors";

const joinFieldErrors = (fieldErrors: FieldError[]): string => {
  const joinedErrorStrings: string[] = fieldErrors.map<string>((error: FieldError) => error.errors.join("\n"));
  return joinedErrorStrings.join("\n");
};

export const createGenre = async (name: string): Promise<Genre> => {
  try {
    const genre: Genre = new Genre(name);

    const errors: FieldError[] | null = await getValidationErrors(genre);
    if (errors) {
      throw new Error(joinFieldErrors(errors));
    }

    const dataRepos: DataRepositories = await getDataRepositories();
    await dataRepos.genre.save(genre);

    return genre;
  } catch (error: unknown) {
    const handledError: unknown = handleQueryError(error);
    const castError: Error = handledError as Error;

    if (castError.message.endsWith("already exists.")) {
      throw new Error(`A genre with the name "${name}" already exists`);
    }

    throw handledError;
  }
};

export const getGenre = async (name: string): Promise<Genre> => {
  try {
    if (!name) {
      throw new Error("A name of an existing genre is required to fetch that genre");
    }

    const dataRepos: DataRepositories = await getDataRepositories();
    const genre: Genre = await dataRepos.genre.findOneByOrFail({ name: name });

    return genre;
  } catch (error: unknown) {
    const handledError: unknown = handleQueryError(error);
    const castError: Error = handledError as Error;

    if (castError.message.startsWith("Could not find")) {
      throw new Error(`A genre with the name "${name}" doesn't exist`);
    }

    throw handledError;
  }
};

export const updateGenre = async (existingName: string, newName: string): Promise<Genre> => {
  try {
    if (!existingName) {
      throw new Error("A name of an existing genre is required to change that genre");
    }

    if (existingName === newName) {
      throw new Error("The existing genre's name and the desired new name for the genre cannot be the same");
    }

    const genre: Genre = await getGenre(existingName);
    genre.name = newName;

    const errors: FieldError[] | null = await getValidationErrors(genre);
    if (errors) {
      throw new Error(joinFieldErrors(errors));
    }

    await genre.save();

    return genre;
  } catch (error: unknown) {
    const handledError: unknown = handleQueryError(error);
    const castError: Error = handledError as Error;

    if (castError.message.endsWith("already exists.")) {
      throw new Error(`A genre with the name "${newName}" already exists`);
    }

    throw handledError;
  }
};

export const deleteGenre = async (name: string): Promise<void> => {
  try {
    if (!name) {
      throw new Error("A name of an existing genre is required to remove that genre");
    }

    const genre: Genre = await getGenre(name);
    await genre.remove();
  } catch (error: unknown) {
    throw handleQueryError(error);
  }
};
