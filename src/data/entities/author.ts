import Book from "@data/entities/book";
import { IsDefined, IsNotEmpty, IsString, IsUUID, Length } from "class-validator";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 } from "uuid";

@Entity({ name: "authors", schema: "metadata" })
export default class Author extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @IsDefined({ message: "Author UUID is required" })
  @IsUUID(4, { message: "Author UUID must be a UUIDv4 string" })
  public readonly uuid!: string;

  @Column("varchar", { length: 100, nullable: false, unique: true })
  @IsDefined({ message: "Author name is required" })
  @IsString({ message: "Author name must be a string" })
  @IsNotEmpty({ message: "Author name cannot be an empty string" })
  @Length(1, 100, { message: "Author name bust be between 1 and 100 characters long" })
  public name!: string;

  @CreateDateColumn({ insert: false })
  public readonly created!: Date;

  @UpdateDateColumn({ insert: false })
  public readonly updated!: Date;

  @OneToMany(() => Book, (book: Book) => book.author, { lazy: true, nullable: false })
  public readonly books!: Promise<Book[]>;

  constructor(name: string) {
    super();

    this.uuid = v4();
    this.name = name;
  }
}
