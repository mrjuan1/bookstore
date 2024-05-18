import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "authors", schema: "metadata" })
export class Author {
  @PrimaryColumn("uuid", { insert: false })
  public uuid?: string;

  @Column("varchar", { length: 100, unique: true })
  public name!: string;

  @Column({ insert: false })
  public created?: Date;

  @Column({ insert: false })
  public updated?: Date;
}

export default Author;
