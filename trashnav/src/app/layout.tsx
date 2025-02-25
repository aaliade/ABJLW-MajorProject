"use client"; // Ensures it's a client component

import React, { useRef, useCallback } from "react";
import Link from 'next/link'


import {Inter} from 'next/font/google'
import {Toaster} from 'react-hot-toast'

import './global.css'



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

