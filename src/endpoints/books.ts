import { BookUpdateOptions, createBook, deleteBook, getBook, updateBook } from "@data/book";
import { DataRepositories, getDataRepositories } from "@data/data-access";
import Book from "@data/entities/book";
import { Express, Response } from "express";

// Not the greatest error handling for the endpoints, I know. Didn't plan ahead enough and I'm out of time now
const handleThrownErrors = (error: unknown, res: Response) => {
  const castError: Error = error as Error;

  if (castError.message.endsWith("doesn't exist")) {
    res.status(404).json({ error: castError.message });
    return;
  }

  if (castError.message.startsWith("At least one field")) {
    res.status(400).json({ error: castError.message });
    return;
  }

  console.error("Unknown error occurred:", castError.message);
  res.sendStatus(500);
};

export const setupBooksEndpoints = (app: Express) => {
  app.get("/books", async (_req, res) => {
    try {
      const dataRepos: DataRepositories = await getDataRepositories();
      const books: Book[] = await dataRepos.book.find();

      res.json(books);
    } catch (error: unknown) {
      handleThrownErrors(error, res);
    }
  });

  app.post("/books", async (req, res) => {
    try {
      const body: BookUpdateOptions = req.body as BookUpdateOptions;
      const errors: string[] = [];

      if (!body.name) {
        errors.push("Book name is required");
      }

      if (!body.author) {
        errors.push("Book author is required");
      }

      if (!body.genre) {
        errors.push("Book genre is required");
      }

      if (!body.price) {
        errors.push("Book price is required");
      }

      if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
      }

      if (body.name && body.author && body.genre && body.price) {
        const book: Book = await createBook(body.name, body.author, body.genre, body.price);
        res.json(book);
      }
    } catch (error: unknown) {
      handleThrownErrors(error, res);
    }
  });

  app.get("/books/:uuid", async (req, res) => {
    try {
      const book: Book = await getBook(req.params.uuid);
      res.json(book);
    } catch (error: unknown) {
      handleThrownErrors(error, res);
    }
  });

  app.put("/books/:uuid", async (req, res) => {
    try {
      const bookUpdateOptions: BookUpdateOptions = req.body as BookUpdateOptions;
      const book: Book = await updateBook(req.params.uuid, bookUpdateOptions);

      res.json(book);
    } catch (error: unknown) {
      handleThrownErrors(error, res);
    }
  });

  // Skipping PATCH ans simulating its behaviour in PUT, not enough time to implement both

  app.delete("/books/:uuid", async (req, res) => {
    try {
      await deleteBook(req.params.uuid);
      res.json({ message: "Book deleted" });
    } catch (error: unknown) {
      handleThrownErrors(error, res);
    }
  });
};
