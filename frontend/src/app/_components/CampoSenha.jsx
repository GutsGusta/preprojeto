"use client";

import { useState } from "react";

export default function CampoSenha(props) {
    const [visivel, setVisivel] = useState(false);

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <input
                {...props}
                type={visivel ? "text" : "password"}
                style={{
                    ...props.style,
                    width: "100%",
                    boxSizing: "border-box",
                    paddingRight: "45px"
                }}
            />

            <button
                type="button"
                onClick={() => setVisivel(!visivel)}
                aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
                style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    color: "#777",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {visivel ? (
                        <>
                            <path d="M3 3l18 18" />
                            <path d="M10.6 10.7a2 2 0 002.7 2.7" />
                            <path d="M9.9 5.2A11 11 0 0112 5c6 0 10 7 10 7a16 16 0 01-3 3.8" />
                            <path d="M6.3 6.3C3.5 8.2 2 12 2 12s4 7 10 7a10 10 0 004.2-.9" />
                        </>
                    ) : (
                        <>
                            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                            <circle cx="12" cy="12" r="3" />
                        </>
                    )}
                </svg>
            </button>
        </div>
    );
}