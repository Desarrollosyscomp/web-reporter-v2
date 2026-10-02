// ==================== IMPORTACIONES ====================
import {
    Column, Entity, JoinColumn, OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { Client } from "./client.entity";

// ==================== ENTIDAD: ConxposUtilityDataBase ====================
@Entity({ name: 'conxpos_utilities_databases', schema: 'public' })
export class ConxposUtilityDataBase {

    // -------------------- Columnas --------------------
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    client_id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    database_name: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    db_user: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    db_password: string;

    @Column({ type: 'boolean', nullable: false, default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn()
    updated_at?: Date;

    // -------------------- Relaciones --------------------
    @OneToOne(() => Client, (client) => client.conxposUtilityDataBase)
    @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
    client: Client;

}
