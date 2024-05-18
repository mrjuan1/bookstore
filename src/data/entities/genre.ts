import Book from "@data/entities/book";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "genres", schema: "metadata" })
export default class Genre {
  @PrimaryColumn("uuid", { insert: false })
  uuid!: string;

  @Column("varchar", { length: 30, nullable: false, unique: true })
  name!: string;

  @CreateDateColumn({ insert: false })
  created!: Date;

  @UpdateDateColumn({ insert: false })
  updated!: Date;

  @OneToMany(() => Book, (book: Book) => book.genre, { lazy: true, nullable: false })
  books!: Promise<Book[]>;
}
