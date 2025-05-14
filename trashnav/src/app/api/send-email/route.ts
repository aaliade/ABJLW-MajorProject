// app/api/send-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    console.log("POST request received");

    try {
        const body = await req.json();
        const { to, subject, text } = body;

        if (!to || !subject || !text) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: "live.smtp.mailtrap.io",
            port: 587,
            secure: false,
            auth: {
                user: "api",
                pass: "a3fa07d5549c812aee16abf9f42c5532",
            },
        });

        // Wrap in an async IIFE so we can use await.
        (async () => {
            const info = await transporter.sendMail({
                from: 'TrashNav <info@demomailtrap.co>',
                to: 'abjlw.majorproject@gmail.com',
                subject: subject,
                text: text,
            });

            console.log("Message sent:", info.messageId);
        })();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Email sending failed:", error.message, error);
        return NextResponse.json(
            { success: false, error: error.message || "Unknown error" },
            { status: 500 }
        );
    }
}
