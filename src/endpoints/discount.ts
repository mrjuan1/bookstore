import { DataRepositories, getDataRepositories } from "@data/data-access";
import Book from "@data/entities/book";
import Genre from "@data/entities/genre";
import { Express } from "express";

// Apologies for the poor implementation again, ran out of time
export const setupDiscountEndpoint = (app: Express) => {
  app.get("/discount", async (req, res) => {
    try {
      if (!req.query["genre"]) {
        res.status(400).json({ error: "A query parameter for genre is required" });
        return;
      }

      if (!req.query["discount"]) {
        res.status(400).json({ error: "A query parameter for the discount percentage is required" });
        return;
      }

      const queryGenre: string = String(req.query["genre"]);
      const queryDiscount: number = parseFloat(String(req.query["discount"]));

      if (isNaN(queryDiscount)) {
        res.status(400).json({ error: "Discount must be a number" });
      }

      const dataRepos: DataRepositories = await getDataRepositories();
      const genres: Genre[] = await dataRepos.genre.find({ where: { name: queryGenre } });

      if (genres.length === 0) {
        res.status(404).json({ error: `No genres found for ${queryGenre}` });
        return;
      }

      const genreBooks: Book[][] = await Promise.all(genres.map(async (genre: Genre) => await genre.books));

      let totalPrice: number = 0;
      genreBooks.forEach((books: Book[]) => {
        books.forEach((book: Book) => {
          totalPrice += book.price;
        });
      });

      if (totalPrice === 0) {
        res
          .status(404)
          .json({ error: `Total price is 0, which means no books were found for the "${queryGenre}" genre` });
        return;
      }

      const discountedPrice: number = totalPrice * (queryDiscount / 100);

      res.json({
        genre: queryGenre,
        discount_percentage: queryDiscount,
        total_discounted_price: (totalPrice - discountedPrice).toFixed(2),
      });
    } catch (error: unknown) {
      const castError: Error = error as Error;
      console.log(castError.message);

      res.sendStatus(500);
    }
  });
};
