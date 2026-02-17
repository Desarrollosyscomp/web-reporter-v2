import {
    Column, Entity, JoinColumn, OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { Client } from "./client.entity";

@Entity({ name: 'conxpos_utilities_auth', schema: 'public' })
export class ConxposUtilityAuth {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    client_id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    database_ip: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    username: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    password: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reset_password_code: string;

    @Column({ type: 'int', nullable: false, default: 1 })
    status: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn()
    updated_at?: Date;

    @OneToOne(() => Client, (client) => client.conxposUtilityAuth)
    @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
    client: Client;

}
