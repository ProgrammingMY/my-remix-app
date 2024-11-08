import {
  relations,
  sql,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import {
  text,
  sqliteTable,
  integer,
  real,
  unique,
  index,
  check,
  primaryKey,
} from "drizzle-orm/sqlite-core";

// User table
export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").$type<"teacher" | "user">(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

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
    uploadId: text("uploadId"),
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

// MuxData table
export const muxData = sqliteTable(
  "muxData",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    assetId: text("assetId").notNull().unique(),
    playbackId: text("playbackId"),
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
      assetIndex: index("muxData_assetId").on(table.assetId),
    };
  }
);

// MuxData relation
export const muxData_relation = relations(muxData, ({ one }) => ({
  chapter: one(chapter, {
    fields: [muxData.chapterId],
    references: [chapter.id],
  }),
}));

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
      .references(() => course.id),
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

export type CourseType = typeof course.$inferSelect;
export type ChapterType = typeof chapter.$inferSelect;
export type AttachmentType = typeof attachment.$inferSelect;
export type MuxDataType = typeof muxData.$inferSelect;
export type CategoryType = typeof category.$inferSelect;
export type UserProgressType = typeof userProgress.$inferSelect;
export type PurchaseType = typeof purchase.$inferSelect;
