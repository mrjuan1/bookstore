import { DataRepositories, getDataRepositories } from "@data/data-access";
import Author from "@data/entities/author";
import { handleQueryError } from "@utils/query-error";
import { FieldError, getValidationErrors } from "@utils/validation-errors";

const joinFieldErrors = (fieldErrors: FieldError[]): string => {
  const joinedErrorStrings: string[] = fieldErrors.map<string>((error: FieldError) => error.errors.join("\n"));
  return joinedErrorStrings.join("\n");
};

export const createAuthor = async (name: string): Promise<Author> => {
  try {
    const author: Author = new Author(name);

    const errors: FieldError[] | null = await getValidationErrors(author);
    if (errors) {
      throw new Error(joinFieldErrors(errors));
    }

    const dataRepos: DataRepositories = await getDataRepositories();
    await dataRepos.author.save(author);

    return author;
  } catch (error: unknown) {
    const handledError: unknown = handleQueryError(error);
    const castError: Error = handledError as Error;

    if (castError.message.endsWith("already exists.")) {
      throw new Error(`An author with the name "${name}" already exists`);
    }

    throw handledError;
  }
};

export const getAuthor = async (name: string): Promise<Author> => {
  try {
    if (!name) {
      throw new Error("A name of an existing author is required to fetch that author");
    }

    const dataRepos: DataRepositories = await getDataRepositories();
    const author: Author = await dataRepos.author.findOneByOrFail({ name });

    return author;
  } catch (error: unknown) {
    const handledError: unknown = handleQueryError(error);
    const castError: Error = handledError as Error;

    if (castError.message.startsWith("Could not find")) {
      throw new Error(`An author with the name "${name}" doesn't exist`);
    }

    throw handledError;
  }
};

export const updateAuthor = async (existingName: string, newName: string): Promise<Author> => {
  try {
    if (!existingName) {
      throw new Error("A name of an existing author is required to change that author");
    }

    if (existingName === newName) {
      throw new Error("The existing author's name and the desired new name for the author cannot be the same");
    }

    const author: Author = await getAuthor(existingName);
    author.name = newName;

    const errors: FieldError[] | null = await getValidationErrors(author);
    if (errors) {
      throw new Error(joinFieldErrors(errors));
    }

    await author.save();

    return author;
  } catch (error: unknown) {
    const handledError: unknown = handleQueryError(error);
    const castError: Error = handledError as Error;

    if (castError.message.endsWith("already exists.")) {
      throw new Error(`An author with the name "${newName}" already exists`);
    }

    throw handledError;
  }
};

export const deleteAuthor = async (name: string): Promise<void> => {
  try {
    if (!name) {
      throw new Error("A name of an existing author is required to remove that author");
    }

    const author: Author = await getAuthor(name);
    await author.remove();
  } catch (error: unknown) {
    throw handleQueryError(error);
  }
};
