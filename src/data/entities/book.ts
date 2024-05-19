import Author from "@data/entities/author";
import Genre from "@data/entities/genre";
import { IsEmpty, IsInt, IsString, Length, Min } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "books", schema: "products" })
export default class Book {
  @PrimaryColumn("uuid", { insert: false })
  public readonly uuid!: string;

  @Column("varchar", { length: 100, nullable: false })
  @IsString({ message: "Book name must be a string" })
  @IsEmpty({ message: "Book name cannot be an empty string" })
  @Length(1, 100, { message: "Book name bust be between 1 and 100 characters long" })
  public name!: string;

  @Column("smallint", { nullable: false })
  @IsInt({ message: "Book price must be a number" })
  @Min(1, { message: "Book price must be more than 1" })
  public price!: number;

  @CreateDateColumn({ insert: false })
  public readonly created!: Date;

  @UpdateDateColumn({ insert: false })
  public readonly updated!: Date;

  @ManyToOne(() => Author, { eager: true, nullable: false, cascade: ["insert"] })
  @JoinColumn({ name: "author_uuid" })
  public readonly author!: Author;

  @ManyToOne(() => Genre, { eager: true, nullable: false, cascade: ["insert"] })
  @JoinColumn({ name: "genre_uuid" })
  public readonly genre!: Genre;
}
