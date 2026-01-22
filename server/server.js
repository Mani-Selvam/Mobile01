require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { GoogleAuth } = require("google-auth-library");
const { db } = require("./src/db/index");
const { users, enquiries } = require("./src/db/schema");
const { eq, or, desc, and } = require("drizzle-orm");

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================
   MIDDLEWARE
====================== */

// IMPORTANT: allow mobile devices
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(express.json());

/* ======================
   GOOGLE AUTH
====================== */

const googleAuth = new GoogleAuth({
    scopes: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
    ],
});

/* ======================
   HEALTH CHECK (TEST THIS)
====================== */

app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

/* ======================
   REGISTER
====================== */

app.post(
    "/api/auth/register",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            const userExists = await db
                .select()
                .from(users)
                .where(eq(users.email, email));

            if (userExists.length > 0) {
                return res.status(400).json({ message: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await db
                .insert(users)
                .values({
                    name,
                    email,
                    password: hashedPassword,
                })
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                });

            const token = jwt.sign(
                { id: newUser[0].id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" },
            );

            res.status(201).json({
                token,
                user: newUser[0],
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    },
);

/* ======================
   LOGIN
====================== */

app.post(
    "/api/auth/login",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const userResult = await db
                .select()
                .from(users)
                .where(eq(users.email, email));

            if (userResult.length === 0) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const user = userResult[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            });

            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    },
);

/* ======================
   GOOGLE LOGIN
====================== */

app.post("/api/auth/google", async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await googleAuth.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, name, email } = payload;

        let userResult = await db
            .select()
            .from(users)
            .where(or(eq(users.googleId, googleId), eq(users.email, email)));

        let user;

        if (userResult.length === 0) {
            const newUser = await db
                .insert(users)
                .values({ name, email, googleId })
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                });
            user = newUser[0];
        } else {
            user = userResult[0];
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Google authentication failed" });
    }
});

/* ======================
   AUTH MIDDLEWARE
====================== */

const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

/* ======================
   ME
====================== */

app.get("/api/auth/me", auth, async (req, res) => {
    try {
        const user = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, req.user.id));

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user[0]);
    } catch {
        res.status(500).json({ message: "Server error" });
    }
});

/* ======================
   ENQUIRY MANAGEMENT
====================== */

// CREATE ENQUIRY
app.post("/api/enquiries", auth, async (req, res) => {
    try {
        const {
            enquiryNumber,
            enquiryType,
            leadSource,
            customerName,
            address,
            mobileNumber,
            alternateMobileNumber,
            productName,
            productVariant,
            productColor,
            productCost,
            paymentMethod,
            enquiryDate,
            enquiryTakenBy,
            remarks,
            followUpRequired,
            nextFollowUpDate,
            enquiryStatus,
        } = req.body;

        // Validation
        if (!customerName || !mobileNumber || !productName || !productCost) {
            return res.status(400).json({
                message:
                    "Missing required fields: customerName, mobileNumber, productName, productCost",
            });
        }

        const result = await db
            .insert(enquiries)
            .values({
                enquiryNumber,
                userId: req.user.id,
                enquiryType,
                leadSource,
                customerName,
                address,
                mobileNumber,
                alternateMobileNumber,
                productName,
                productVariant,
                productColor,
                productCost,
                paymentMethod,
                enquiryDate,
                enquiryTakenBy,
                remarks,
                followUpRequired,
                nextFollowUpDate,
                enquiryStatus,
            })
            .returning();

        res.status(201).json({
            message: "Enquiry created successfully",
            enquiry: result[0],
        });
    } catch (error) {
        console.error("Create enquiry error:", error);
        res.status(500).json({ message: "Failed to create enquiry" });
    }
});

// GET ALL ENQUIRIES FOR LOGGED-IN USER
app.get("/api/enquiries", auth, async (req, res) => {
    try {
        const userEnquiries = await db
            .select()
            .from(enquiries)
            .where(eq(enquiries.userId, req.user.id))
            .orderBy(desc(enquiries.createdAt));

        res.json({
            message: "Enquiries retrieved successfully",
            enquiries: userEnquiries,
            total: userEnquiries.length,
        });
    } catch (error) {
        console.error("Get enquiries error:", error);
        res.status(500).json({ message: "Failed to retrieve enquiries" });
    }
});

// GET SINGLE ENQUIRY BY ID
app.get("/api/enquiries/:id", auth, async (req, res) => {
    try {
        const enquiryId = parseInt(req.params.id);

        const enquiry = await db
            .select()
            .from(enquiries)
            .where(eq(enquiries.id, enquiryId));

        if (enquiry.length === 0) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        // Check if user owns this enquiry
        if (enquiry[0].userId !== req.user.id) {
            return res
                .status(403)
                .json({ message: "Unauthorized access to enquiry" });
        }

        res.json({
            message: "Enquiry retrieved successfully",
            enquiry: enquiry[0],
        });
    } catch (error) {
        console.error("Get single enquiry error:", error);
        res.status(500).json({ message: "Failed to retrieve enquiry" });
    }
});

// UPDATE ENQUIRY
app.put("/api/enquiries/:id", auth, async (req, res) => {
    try {
        const enquiryId = parseInt(req.params.id);

        // Check if enquiry exists and belongs to user
        const existing = await db
            .select()
            .from(enquiries)
            .where(eq(enquiries.id, enquiryId));

        if (existing.length === 0) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        if (existing[0].userId !== req.user.id) {
            return res
                .status(403)
                .json({ message: "Unauthorized access to enquiry" });
        }

        // Extract only updatable fields from request body
        const {
            enquiryType,
            leadSource,
            customerName,
            address,
            mobileNumber,
            alternateMobileNumber,
            productName,
            productCost,
            paymentMethod,
            enquiryDate,
            enquiryTakenBy,
            remarks,
            followUpRequired,
            nextFollowUpDate,
            enquiryStatus,
        } = req.body;

        const updateData = {
            enquiryType,
            leadSource,
            customerName,
            address,
            mobileNumber,
            alternateMobileNumber,
            productName,
            productCost,
            paymentMethod,
            enquiryDate,
            enquiryTakenBy,
            remarks,
            followUpRequired,
            nextFollowUpDate,
            enquiryStatus,
            updatedAt: new Date(),
        };

        const result = await db
            .update(enquiries)
            .set(updateData)
            .where(eq(enquiries.id, enquiryId))
            .returning();

        res.json({
            message: "Enquiry updated successfully",
            enquiry: result[0],
        });
    } catch (error) {
        console.error("Update enquiry error:", error);
        res.status(500).json({ message: "Failed to update enquiry" });
    }
});

// DELETE ENQUIRY
app.delete("/api/enquiries/:id", auth, async (req, res) => {
    try {
        const enquiryId = parseInt(req.params.id);

        // Check if enquiry exists and belongs to user
        const existing = await db
            .select()
            .from(enquiries)
            .where(eq(enquiries.id, enquiryId));

        if (existing.length === 0) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        if (existing[0].userId !== req.user.id) {
            return res
                .status(403)
                .json({ message: "Unauthorized access to enquiry" });
        }

        await db.delete(enquiries).where(eq(enquiries.id, enquiryId));

        res.json({ message: "Enquiry deleted successfully" });
    } catch (error) {
        console.error("Delete enquiry error:", error);
        res.status(500).json({ message: "Failed to delete enquiry" });
    }
});

// GET ENQUIRIES BY STATUS
app.get("/api/enquiries/status/:status", auth, async (req, res) => {
    try {
        const status = req.params.status;

        const userEnquiries = await db
            .select()
            .from(enquiries)
            .where(
                and(
                    eq(enquiries.userId, req.user.id),
                    eq(enquiries.enquiryStatus, status),
                ),
            )
            .orderBy(desc(enquiries.createdAt));

        res.json({
            message: "Enquiries retrieved successfully",
            enquiries: userEnquiries,
            total: userEnquiries.length,
        });
    } catch (error) {
        console.error("Get enquiries by status error:", error);
        res.status(500).json({ message: "Failed to retrieve enquiries" });
    }
});

/* ======================
   LISTEN (THIS IS THE KEY FIX)
====================== */

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
