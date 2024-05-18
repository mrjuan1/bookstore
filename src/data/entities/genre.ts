import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "genres", schema: "metadata" })
export default class Genre {
  @PrimaryColumn("uuid", { insert: false })
  uuid!: string;

  @Column("varchar", { length: 30, nullable: false, unique: true })
  name!: string;

  @CreateDateColumn({ insert: false })
  created!: Date;

  @UpdateDateColumn({ insert: false })
  updated!: Date;
}
