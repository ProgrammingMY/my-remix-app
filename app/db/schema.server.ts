import { relations, sql } from "drizzle-orm";
import {
  text,
  sqliteTable,
  integer,
  real,
  unique,
  index,
  primaryKey,
  blob,
} from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";

// User table
export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  email: text("email").notNull().unique(),
  name: text("name"),
  imageUrl: text("imageUrl"),
  roleId: integer("roleId").references(() => role.id),
  hashedPassword: text("hashedPassword"),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .default(false)
    .notNull(),
  totpKey: blob("totpKey"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// User relation
export const user_relation = relations(user, ({ one, many }) => ({
  role: one(role, { fields: [user.roleId], references: [role.id] }),
}));

// Session table
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  twoFactorVerified: integer("two_factor_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// Session relation
export const session_relation = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// Email verification table
export const emailVerification = sqliteTable("email_verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// Email verification relation
export const emailVerification_relation = relations(
  emailVerification,
  ({ one }) => ({
    user: one(user, {
      fields: [emailVerification.userId],
      references: [user.id],
    }),
  })
);

// Password reset table
export const passwordReset = sqliteTable("password_reset", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  twoFactorVerified: integer("two_factor_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  expiresAt: integer("expires_at").notNull(),
});

// Password reset relation
export const passwordReset_relation = relations(passwordReset, ({ one }) => ({
  user: one(user, {
    fields: [passwordReset.userId],
    references: [user.id],
  }),
}));

// Connection table
export const connection = sqliteTable(
  "connection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    providerId: text("providerId").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => {
    return {
      indexProviderId: index("provider_id").on(table.providerId),
    };
  }
);

// Role table
export const role = sqliteTable("role", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

// Role relation
export const role_relation = relations(role, ({ many }) => ({
  users: many(user),
}));

// Course table
export const course = sqliteTable(
  "course",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("imageUrl"),
    price: real("price"),
    isPublished: integer("isPublished", { mode: "boolean" })
      .default(false)
      .notNull(),
    categoryId: text("categoryId").references(() => category.id, {
      onDelete: "cascade",
    }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => {
    return {
      categoryIndex: index("course_categoryId").on(table.categoryId),
    };
  }
);

// Course relation
export const course_relation = relations(course, ({ one, many }) => ({
  category: one(category, {
    fields: [course.categoryId],
    references: [category.id],
  }),
  chapters: many(chapter),
  attachments: many(attachment),
  purchases: many(purchase),
}));

// Category table
export const category = sqliteTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
});

// Category relation
export const category_relation = relations(category, ({ many }) => ({
  courses: many(course),
}));

// Chapter table
export const chapter = sqliteTable(
  "chapter",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    videoId: text("videoId"),
    position: integer("position").notNull(),
    isPublished: integer("isPublished", { mode: "boolean" })
      .default(false)
      .notNull(),
    isFree: integer("isFree", { mode: "boolean" }).default(false).notNull(),
    courseId: text("courseId")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => {
    return {
      courseIndex: index("chapter_courseId").on(table.courseId),
    };
  }
);

// Chapter relation
export const chapter_relation = relations(chapter, ({ one, many }) => ({
  course: one(course, { fields: [chapter.courseId], references: [course.id] }),
  bunnyData: one(bunnyData, {
    fields: [chapter.videoId],
    references: [bunnyData.videoId],
  }),
  userProgress: many(userProgress),
}));

// Attachment table
export const attachment = sqliteTable(
  "attachment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("courseId")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    fileUrl: text("fileUrl").notNull(),
    fileName: text("fileName").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => {
    return {
      courseIndex: index("attachment_courseId").on(table.courseId),
    };
  }
);

// Attachment relation
export const attachment_relation = relations(attachment, ({ one }) => ({
  course: one(course, {
    fields: [attachment.courseId],
    references: [course.id],
  }),
}));

// BunnyData table
export const bunnyData = sqliteTable(
  "bunnyData",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    videoId: text("videoId").notNull().unique(),
    libraryId: integer("libraryId", { mode: "number" }).notNull(),
    status: integer("status", { mode: "number" }).default(0).notNull(),
    chapterId: text("chapterId")
      .unique()
      .references(() => chapter.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => {
    return {
      assetIndex: index("bunnyData_videoId").on(table.videoId),
    };
  }
);

// UserProgress table
export const userProgress = sqliteTable(
  "userProgress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    chapterId: text("chapterId")
      .notNull()
      .references(() => chapter.id, { onDelete: "cascade" }),
    isCompleted: integer("isCompleted", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => {
    return {
      userIndex: unique("unique_user_chapter").on(
        table.userId,
        table.chapterId
      ),
      chapterIndex: index("userProgress_chapterId").on(table.chapterId),
    };
  }
);

// UserProgress relation
export const userProgress_relation = relations(userProgress, ({ one }) => ({
  chapter: one(chapter, {
    fields: [userProgress.chapterId],
    references: [chapter.id],
  }),
}));

// Purchase table
export const purchase = sqliteTable(
  "purchase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    courseId: text("courseId")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => {
    return {
      userIndex: unique("purchase_user_course_unique").on(
        table.userId,
        table.courseId
      ),
      courseIndex: index("purchase_courseId").on(table.courseId),
    };
  }
);

// Purchase relation
export const purchase_relation = relations(purchase, ({ one }) => ({
  course: one(course, { fields: [purchase.courseId], references: [course.id] }),
}));

// ToyyibCustomer table
export const toyyibCustomer = sqliteTable(
  "toyyibCustomer",
  {
    userId: text("userId").notNull(),
    courseId: text("courseId")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    billCode: text("billCode").notNull(),
    transactionId: text("transactionId"),
    status: text("status").$type<"pending" | "success" | "failed">(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: "userId_courseId",
        columns: [table.userId, table.courseId],
      }),
    };
  }
);

// toyyibCustomer relation
export const toyyibCustomer_relation = relations(toyyibCustomer, ({ one }) => ({
  course: one(course, {
    fields: [toyyibCustomer.courseId],
    references: [course.id],
  }),
}));

export type UserType = typeof user.$inferSelect;
export type SessionType = typeof session.$inferSelect;
export type CourseType = typeof course.$inferSelect;
export type ChapterType = typeof chapter.$inferSelect;
export type AttachmentType = typeof attachment.$inferSelect;
export type BunnyDataType = typeof bunnyData.$inferSelect;
export type CategoryType = typeof category.$inferSelect;
export type UserProgressType = typeof userProgress.$inferSelect;
export type PurchaseType = typeof purchase.$inferSelect;
