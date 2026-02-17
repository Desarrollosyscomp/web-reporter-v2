import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany,
  OneToOne, UpdateDateColumn, JoinColumn, ManyToMany, JoinTable, ManyToOne
} from 'typeorm';
import { ConxposUtilityAuth } from './conxpos-utility-auth.entity';
import { ConxposUtilityDataBase } from './conxpos-utility-databases.entity';


@Entity({ name: 'clients', schema: 'public' })
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  clientable_type: string;

  @Column({ type: 'int', nullable: false })
  clientable_id: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  is_active: boolean;

  @Column({})
  tax_schema_dian_id: string;

  @Column({})
  fiscal_obligation_dian_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  //  @OneToMany(() => Tenant, (tenant) => tenant.client)
  // tenant: Tenant[];

  // @OneToOne(() => Company, (company) => company.client)
  // @JoinColumn({ name: 'clientable_id', referencedColumnName: 'id' })
  // company: Company;

  // @OneToOne(() => People, (people) => people.client)
  // @JoinColumn({ name: 'clientable_id', referencedColumnName: 'id' })
  // person: People;

  // @ManyToMany(
  //   () => FinancialActivity,
  //   (financialActivity) => financialActivity.clients,
  // )
  // @JoinTable({
  //   name: 'clients_financial_activities',
  //   joinColumns: [{ name: 'client_id', referencedColumnName: 'id' }],
  //   inverseJoinColumns: [
  //     { name: 'financial_activity_id', referencedColumnName: 'id' },
  //   ],
  // })
  // financialActivities: FinancialActivity[];

  // @ManyToOne(() => TaxSchema, (taxSchema) => taxSchema.clients)
  // @JoinColumn({ name: 'tax_schema_dian_id', referencedColumnName: 'dian_id' })
  // taxSchema: TaxSchema;

  // @ManyToOne(() => FiscalObligation, (fiscalObligation) => fiscalObligation.clients)
  // @JoinColumn({ name: 'fiscal_obligation_dian_id', referencedColumnName: 'dian_id' })
  // fiscalObligation: FiscalObligation;

  // @OneToMany(() => License, (license) => license.client)
  // licenses: License[];

  @OneToOne(() => ConxposUtilityAuth, (conxposUtilityAuth) => conxposUtilityAuth.client)
  conxposUtilityAuth: ConxposUtilityAuth;

  @OneToOne(() => ConxposUtilityDataBase, (conxposUtilityDataBase) => conxposUtilityDataBase.client)
  conxposUtilityDataBase: ConxposUtilityDataBase;
}