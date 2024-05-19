import Book from "@data/entities/book";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "genres", schema: "metadata" })
export default class Genre {
  @PrimaryColumn("uuid", { insert: false })
  public readonly uuid!: string;

  @Column("varchar", { length: 30, nullable: false, unique: true })
  @IsString({ message: "Genre name must be a string" })
  @IsNotEmpty({ message: "Genre name cannot be an empty string" })
  @Length(1, 30, { message: "Genre name bust be between 1 and 30 characters long" })
  public name!: string;

  @CreateDateColumn({ insert: false })
  public readonly created!: Date;

  @UpdateDateColumn({ insert: false })
  public readonly updated!: Date;

  @OneToMany(() => Book, (book: Book) => book.genre, { lazy: true, nullable: false })
  public readonly books!: Promise<Book[]>;
}
