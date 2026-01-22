const {
    pgTable,
    serial,
    text,
    timestamp,
    integer,
    varchar,
    boolean,
} = require("drizzle-orm/pg-core");

const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password"),
    googleId: text("google_id").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

const enquiries = pgTable("enquiries", {
    id: serial("id").primaryKey(),
    enquiryNumber: varchar("enquiry_number", { length: 50 }).notNull().unique(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    enquiryType: varchar("enquiry_type", { length: 100 }),
    leadSource: varchar("lead_source", { length: 100 }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    address: text("address"),
    mobileNumber: varchar("mobile_number", { length: 20 }).notNull(),
    alternateMobileNumber: varchar("alternate_mobile_number", { length: 20 }),
    productName: varchar("product_name", { length: 255 }).notNull(),
    productCost: varchar("product_cost", { length: 20 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }),
    enquiryDate: varchar("enquiry_date", { length: 50 }).notNull(),
    enquiryTakenBy: varchar("enquiry_taken_by", { length: 255 }).notNull(),
    remarks: text("remarks"),
    followUpRequired: varchar("follow_up_required", { length: 10 }),
    nextFollowUpDate: varchar("next_follow_up_date", { length: 50 }),
    enquiryStatus: varchar("enquiry_status", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

module.exports = { users, enquiries };
