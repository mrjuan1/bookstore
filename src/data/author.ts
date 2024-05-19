import { DataRepositories, getDataRepositories } from "@data/data-access";
import Author from "@data/entities/author";
import { handleQueryError } from "@utils/query-error";
import { FieldError, getValidationErrors } from "@utils/validation-errors";

type AddAuthorFunc = (name: string) => Promise<Author>;

export const addAuthor: AddAuthorFunc = async (name: string): Promise<Author> => {
  try {
    const author: Author = new Author(name);

    const errors: FieldError[] | null = await getValidationErrors(author);
    if (errors) {
      throw errors;
    }

    const dataRepos: DataRepositories = await getDataRepositories();
    await dataRepos.author.save(author);

    return author;
  } catch (error: unknown) {
    throw handleQueryError(error);
  }
};
