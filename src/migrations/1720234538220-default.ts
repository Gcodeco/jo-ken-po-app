import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1720234538220 implements MigrationInterface {
    name = 'Default1720234538220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "apostas" ("id" SERIAL NOT NULL, "valorDaAposta" numeric(10,2) NOT NULL, "dataAposta" TIMESTAMP NOT NULL DEFAULT now(), "resultado" text, "apostadorId" integer, "desafioId" integer, CONSTRAINT "PK_3d953015ea9f51b840343239ce6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "apostas" ADD CONSTRAINT "FK_ab6a8b6260328382970f676444c" FOREIGN KEY ("apostadorId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "apostas" ADD CONSTRAINT "FK_b10e96dab114105ea7404c4edbf" FOREIGN KEY ("desafioId") REFERENCES "desafios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "apostas" DROP CONSTRAINT "FK_b10e96dab114105ea7404c4edbf"`);
        await queryRunner.query(`ALTER TABLE "apostas" DROP CONSTRAINT "FK_ab6a8b6260328382970f676444c"`);
        await queryRunner.query(`DROP TABLE "apostas"`);
    }

}
