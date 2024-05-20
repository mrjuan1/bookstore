import "reflect-metadata";

import { setupBooksEndpoints } from "@endpoints/books";
import { setupDiscountEndpoint } from "@endpoints/discount";
import { getEnvVar } from "@utils/env-vars";
import bodyParser from "body-parser";
import express, { Express } from "express";

const app: Express = express();
app.use(bodyParser.json());

setupBooksEndpoints(app);
setupDiscountEndpoint(app);

const port: number = parseInt(getEnvVar("API_PORT"));
app.listen(port, () => {
  console.log("API running on port 3000");
});
