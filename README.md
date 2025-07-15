# IoT Dashboard

A modern IoT dashboard application built with Next.js 15 and React 18.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Lucide icons
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Supabase](https://supabase.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **IoT Connectivity**: [MQTT.js](https://www.npmjs.com/package/mqtt)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) (dark/light mode support)

## Getting Started

First, make sure you have the required environment variables set up in a `.env` file:

```bash
# Required environment variables
DATABASE_URL="your-postgres-connection-string"
# Add any other environment variables here
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app/` - Next.js App Router pages and components
- `src/db/` - Database schema and connection
- `src/lib/` - Utility functions
- `supabase/` - Supabase migrations (managed by Drizzle Kit)

## Database Migrations

To generate migrations:

```bash
npx drizzle-kit generate
```

## Features

- Real-time IoT device monitoring
- Dark/light mode
- Responsive dashboard interface

## Development

You can start editing the dashboard by modifying files in `src/app/`. The application auto-updates as you edit files.

## Learn More

To learn more about the technologies used in this stack:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js#readme)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
