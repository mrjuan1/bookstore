import Author from "@data/entities/author";

test("test", () => {
  const author: Author = new Author();
  expect<Author>(author).toBeTruthy();
});
