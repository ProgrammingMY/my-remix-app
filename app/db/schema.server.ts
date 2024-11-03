import { sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  text,
  sqliteTable,
  integer,
  real,
  unique,
  index,
  check,
} from "drizzle-orm/sqlite-core";

// User table
export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").$type<"teacher" | "user">(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Course table
export const Course = sqliteTable(
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
    categoryId: text("categoryId").references(() => Category.id, {
      onDelete: "cascade",
    }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      categoryIndex: index("course_categoryId").on(table.categoryId),
    };
  }
);

// Category table
export const Category = sqliteTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
});

// Chapter table
export const Chapter = sqliteTable(
  "chapter",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    uploadId: text("uploadId"),
    position: integer("position").notNull(),
    isPublished: integer("isPublished", { mode: "boolean" })
      .default(false)
      .notNull(),
    isFree: integer("isFree", { mode: "boolean" }).default(false).notNull(),
    courseId: text("courseId")
      .notNull()
      .references(() => Course.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      courseIndex: index("chapter_courseId").on(table.courseId),
    };
  }
);

// Attachment table
export const Attachment = sqliteTable(
  "attachment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("courseId")
      .notNull()
      .references(() => Course.id, { onDelete: "cascade" }),
    fileUrl: text("fileUrl").notNull(),
    fileName: text("fileName").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      courseIndex: index("attachment_courseId").on(table.courseId),
    };
  }
);

// MuxData table
export const MuxData = sqliteTable(
  "muxData",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    assetId: text("assetId").notNull().unique(),
    playbackId: text("playbackId"),
    chapterId: text("chapterId")
      .unique()
      .references(() => Chapter.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      assetIndex: index("muxData_assetId").on(table.assetId),
    };
  }
);

// UserProgress table
export const UserProgress = sqliteTable(
  "userProgress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    chapterId: text("chapterId")
      .notNull()
      .references(() => Chapter.id, { onDelete: "cascade" }),
    isCompleted: integer("isCompleted", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
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

// Purchase table
export const Purchase = sqliteTable(
  "purchase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    courseId: text("courseId")
      .notNull()
      .references(() => Course.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
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

// ToyyibCustomer table
export const ToyyibCustomer = sqliteTable(
  "toyyibCustomer",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    courseId: text("courseId")
      .notNull()
      .references(() => Course.id, { onDelete: "cascade" }),
    billCode: text("billCode").notNull(),
    transactionId: text("transactionId").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      userIndex: unique("toyyib_user_course_unique").on(
        table.userId,
        table.courseId
      ),
    };
  }
);

export type CourseType = typeof Course.$inferSelect;
export type ChapterType = typeof Chapter.$inferSelect;
export type AttachmentType = typeof Attachment.$inferSelect;
export type MuxDataType = typeof MuxData.$inferSelect;
