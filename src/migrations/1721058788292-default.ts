import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1721058788292 implements MigrationInterface {
    name = 'Default1721058788292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "desafios" ADD "idUsuarioGanhou" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "desafios" DROP COLUMN "idUsuarioGanhou"`);
    }

}
