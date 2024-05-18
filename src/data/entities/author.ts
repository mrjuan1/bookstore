import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

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
}
