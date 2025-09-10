// src/components/ContactForm.tsx
"use client";
import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export default function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyCaptcha = async (token: string) => {
    const res = await fetch("/api/verify-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return res.json();
  };

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    if (!executeRecaptcha) {
      setStatus("⚠️ reCAPTCHA not available. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      // Execute reCAPTCHA
      const captchaToken = await executeRecaptcha("contact_form");

      if (!captchaToken) {
        setStatus("⚠️ reCAPTCHA verification failed.");
        setLoading(false);
        return;
      }

      // Verify the token
      const verify = await verifyCaptcha(captchaToken);
      if (!verify.success) {
        setStatus("⚠️ reCAPTCHA failed, try again.");
        setLoading(false);
        return;
      }

      // Send email
      const result = await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
        form.current!,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string
      );

      if (result.text === "OK") {
        setStatus("✅ Message sent successfully!");
        form.current?.reset();

        // Clear success message after 5 seconds
        setTimeout(() => setStatus(""), 5000);
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
        name="name"
        placeholder="Your Name"
        required
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <input
        type="email"
        name="email"
        placeholder="Your Email"
        required
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <input
        type="number"
        name="number"
        placeholder="Your Phone Number"
        required
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <textarea
        name="message"
        placeholder="Your Message"
        required
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={5}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>

      {status && (
        <p
          className={`text-sm mt-2 ${
            status.includes("✅")
              ? "text-green-600"
              : status.includes("❌")
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {status}
        </p>
      )}
    </form>
  );
}
