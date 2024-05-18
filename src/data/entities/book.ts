import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "books", schema: "products" })
export default class Book {
  @PrimaryColumn("uuid", { insert: false })
  uuid!: string;

  @Column("varchar", { length: 100, nullable: false })
  name!: string;

  @Column("uuid")
  authorUuid!: string;

  @Column("uuid")
  genreUuid!: string;

  @CreateDateColumn({ insert: false })
  created!: Date;

  @UpdateDateColumn({ insert: false })
  updated!: Date;
}
