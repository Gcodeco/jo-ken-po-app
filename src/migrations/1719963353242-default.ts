import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1719963353242 implements MigrationInterface {
    name = 'Default1719963353242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "desafios" ("id" SERIAL NOT NULL, "escolhaDoUsuarioCriador" text NOT NULL, "nome" text, "escolhaDoUsuarioAceitou" text, "resultado" text, "valorDaAposta" numeric, "id_criador" integer, "id_acetou" integer, CONSTRAINT "PK_04126745b4c93c5e5be5a639bb0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "name" text NOT NULL, "date_nasc" date NOT NULL, "cpf" bigint NOT NULL, "rg" bigint NOT NULL, "username" text NOT NULL, "password" text NOT NULL, "email" text NOT NULL, "date_cadastro" TIMESTAMP NOT NULL DEFAULT now(), "moeda" double precision NOT NULL DEFAULT '1000', CONSTRAINT "UQ_ebebcaef8457dcff6e6d69f17b0" UNIQUE ("cpf"), CONSTRAINT "UQ_1087107b59843f51aeab282de1e" UNIQUE ("rg"), CONSTRAINT "UQ_9f78cfde576fc28f279e2b7a9cb" UNIQUE ("username"), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "desafios" ADD CONSTRAINT "FK_f25604290a4d39effeae2ad12c9" FOREIGN KEY ("id_criador") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "desafios" ADD CONSTRAINT "FK_a25d53793a8d74a401a0ec4647f" FOREIGN KEY ("id_acetou") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "desafios" DROP CONSTRAINT "FK_a25d53793a8d74a401a0ec4647f"`);
        await queryRunner.query(`ALTER TABLE "desafios" DROP CONSTRAINT "FK_f25604290a4d39effeae2ad12c9"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "desafios"`);
    }

}
