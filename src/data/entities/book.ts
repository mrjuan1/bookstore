import Author from "@data/entities/author";
import Genre from "@data/entities/genre";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "books", schema: "products" })
export default class Book {
  @PrimaryColumn("uuid", { insert: false })
  uuid!: string;

  @Column("varchar", { length: 100, nullable: false })
  name!: string;

  @Column("smallint", { nullable: false })
  price!: number;

  @CreateDateColumn({ insert: false })
  created!: Date;

  @UpdateDateColumn({ insert: false })
  updated!: Date;

  @ManyToOne(() => Author, { eager: true, nullable: false, cascade: ["insert"] })
  @JoinColumn({ name: "author_uuid" })
  author!: Author;

  @ManyToOne(() => Genre, { eager: true, nullable: false, cascade: ["insert"] })
  @JoinColumn({ name: "genre_uuid" })
  genre!: Genre;
}
