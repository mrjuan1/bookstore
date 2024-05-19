import Author from "@data/entities/author";
import Genre from "@data/entities/genre";
import { IsDefined, IsInt, IsNotEmpty, IsString, IsUUID, Length, Min } from "class-validator";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 } from "uuid";

@Entity({ name: "books", schema: "products" })
export default class Book extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @IsDefined({ message: "Book UUID is required" })
  @IsUUID(4, { message: "Book UUID must be a UUIDv4 string" })
  public readonly uuid!: string;

  @Column("varchar", { length: 100, nullable: false, unique: true })
  @IsDefined({ message: "Book name is required" })
  @IsString({ message: "Book name must be a string" })
  @IsNotEmpty({ message: "Book name cannot be an empty string" })
  @Length(1, 100, { message: "Book name bust be between 1 and 100 characters long" })
  public name!: string;

  @Column("smallint", { nullable: false })
  @IsDefined({ message: "Book price is required" })
  @IsInt({ message: "Book price must be an integer" })
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

  constructor(name: string, price: number) {
    super();

    this.uuid = v4();
    this.name = name;
    this.price = price;
  }
}
