import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1722261985616 implements MigrationInterface {
    name = 'Default1722261985616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "desafios" RENAME COLUMN "nome" TO "nomeUsuarioCriador"`);
        await queryRunner.query(`ALTER TABLE "desafios" ALTER COLUMN "valorDaAposta" TYPE numeric(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "desafios" ALTER COLUMN "valorDaAposta" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "desafios" RENAME COLUMN "nomeUsuarioCriador" TO "nome"`);
    }

}
