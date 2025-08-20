/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema as Db } from "../schema";

type UserInsert = typeof Db.user.$inferInsert;

/**
 * Seeds the database with test user accounts.
 */
export async function seedUsers(db: PostgresJsDatabase<typeof Db>) {
  console.log("Seeding users...");

  // Test user data with realistic names, email addresses, and profile images
  const users: UserInsert[] = [
    { 
      name: "Alice Johnson", 
      email: "alice@example.com", 
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Bob Smith", 
      email: "bob@example.com", 
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Charlie Brown",
      email: "charlie@example.com",
      emailVerified: false,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Diana Prince", 
      email: "diana@example.com", 
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Eve Davis", 
      email: "eve@example.com", 
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Frank Miller", 
      email: "frank@example.com", 
      emailVerified: false,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Grace Lee", 
      email: "grace@example.com", 
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Henry Wilson", 
      email: "henry@example.com", 
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Ivy Chen", 
      email: "ivy@example.com", 
      emailVerified: false,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Jack Thompson", 
      email: "jack@example.com", 
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
    },
  ];

  for (const user of users) {
    await db.insert(Db.user).values(user).onConflictDoNothing();
  }

  console.log(`✅ Seeded ${users.length} test users`);
}
