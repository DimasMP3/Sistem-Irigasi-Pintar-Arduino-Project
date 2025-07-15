CREATE TABLE "kelembapan_tanah" (
	"id" serial PRIMARY KEY NOT NULL,
	"nilai" integer NOT NULL,
	"persen" integer NOT NULL,
	"mode" text NOT NULL,
	"waktu" timestamp DEFAULT now()
);
