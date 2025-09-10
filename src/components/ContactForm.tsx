"use client";
import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { GoogleReCaptcha } from "react-google-recaptcha-v3";

export default function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const verifyCaptcha = async () => {
    const res = await fetch("/api/verify-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: captchaToken }),
    });
    return res.json();
  };

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    if (!captchaToken) {
      setStatus("⚠️ Please complete the reCAPTCHA.");
      setLoading(false);
      return;
    }

    const verify = await verifyCaptcha();
    if (!verify.success) {
      setStatus("⚠️ reCAPTCHA failed, try again.");
      setLoading(false);
      return;
    }

    try {
      const result = await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
        form.current!,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string
      );

      if (result.text === "OK") {
        setStatus("✅ Message sent successfully!");
        form.current?.reset();
        setCaptchaToken(null);
      }
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("❌ Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <form
      ref={form}
      onSubmit={sendEmail}
      className="space-y-4 max-w-md mx-auto p-4 border rounded-lg shadow"
    >
      <input
        type="text"
        name="user_name"
        placeholder="Your Name"
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="email"
        name="user_email"
        placeholder="Your Email"
        required
        className="w-full border p-2 rounded"
      />

      <textarea
        name="message"
        placeholder="Your Message"
        required
        className="w-full border p-2 rounded"
        rows={5}
      />

      <GoogleReCaptcha
        onVerify={(token) => setCaptchaToken(token)}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>

      {status && <p className="text-sm mt-2">{status}</p>}
    </form>
  );
}