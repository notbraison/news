import React from "react";

const Contact: React.FC = () => (
  <div className="container mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
    <p className="text-lg text-muted-foreground max-w-2xl mb-6">
      Have questions, feedback, or want to get in touch? Reach out to us below!
    </p>
    <ul className="space-y-2">
      <li>
        Email:{" "}
        <a
          href="mailto:contact@newsportal.com"
          className="text-primary underline"
        >
          contact@newsportal.com
        </a>
      </li>
      <li>
        Phone:{" "}
        <a href="tel:+1234567890" className="text-primary underline">
          +1 234 567 890
        </a>
      </li>
      <li>Address: 123 News Street, City</li>
    </ul>
  </div>
);

export default Contact;
