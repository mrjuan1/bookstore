import Book from "@data/entities/book";
import { IsString, Length } from "class-validator";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "authors", schema: "metadata" })
export default class Author {
  @PrimaryColumn("uuid", { insert: false })
  public readonly uuid!: string;

  @Column("varchar", { length: 100, nullable: false, unique: true })
  @IsString()
  @Length(1, 100, { message: "Author name bust be between 1 and 100 characters long" })
  public name!: string;

  @CreateDateColumn({ insert: false })
  public readonly created!: Date;

  @UpdateDateColumn({ insert: false })
  public readonly updated!: Date;

  @OneToMany(() => Book, (book: Book) => book.author, { lazy: true, nullable: false })
  public books!: Promise<Book[]>;
}
