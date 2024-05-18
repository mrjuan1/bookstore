import Book from "@data/entities/book";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "authors", schema: "metadata" })
export default class Author {
  @PrimaryColumn("uuid", { insert: false })
  uuid!: string;

  @Column("varchar", { length: 100, nullable: false, unique: true })
  name!: string;

  @CreateDateColumn({ insert: false })
  created!: Date;

  @UpdateDateColumn({ insert: false })
  updated!: Date;

  @OneToMany(() => Book, (book: Book) => book.author, { lazy: true, nullable: false })
  books!: Promise<Book[]>;
}
