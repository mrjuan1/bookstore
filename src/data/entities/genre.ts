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

@Entity({ name: "genres", schema: "metadata" })
export default class Genre extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @IsDefined({ message: "Genre UUID is required" })
  @IsUUID(4, { message: "Genre UUID must be a UUIDv4 string" })
  public readonly uuid!: string;

  @Column("varchar", { length: 30, nullable: false, unique: true })
  @IsDefined({ message: "Genre name is required" })
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

  constructor(name: string) {
    super();

    this.uuid = v4();
    this.name = name;
  }
}
