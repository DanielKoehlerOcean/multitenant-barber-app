
import React from "react";

const LoadingStyles = () => (
    <style
        dangerouslySetInnerHTML={{
            __html: `
                @keyframes snipTop {
                    0%, 100% {
                        transform: rotate(22deg);
                    }

                    35%, 55% {
                        transform: rotate(0deg);
                    }
                }

                @keyframes snipBottom {
                    0%, 100% {
                        transform: rotate(-22deg);
                    }

                    35%, 55% {
                        transform: rotate(0deg);
                    }
                }

                @keyframes loadingDots {
                    0%, 100% {
                        opacity: 0.25;
                    }

                    50% {
                        opacity: 1;
                    }
                }

                .snip-top {
                    transform-origin: 50px 50px;
                    animation: snipTop 1.4s ease-in-out infinite;
                }

                .snip-bottom {
                    transform-origin: 50px 50px;
                    animation: snipBottom 1.4s ease-in-out infinite;
                }

                .loading-dot-1 {
                    animation: loadingDots 1.2s infinite;
                }

                .loading-dot-2 {
                    animation: loadingDots 1.2s infinite 0.2s;
                }

                .loading-dot-3 {
                    animation: loadingDots 1.2s infinite 0.4s;
                }
            `,
        }}
    />
);

const ScissorsSVG = () => (
    <svg
        viewBox="0 0 100 100"
        className="h-12 w-12"
        aria-hidden="true"
    >
        {/* Tesoura superior */}
        <g className="snip-top">
            <circle
                cx="27"
                cy="30"
                r="9"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
            />

            <path
                d="M34 36 L50 50 L88 50"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>

        {/* Tesoura inferior */}
        <g className="snip-bottom">
            <circle
                cx="27"
                cy="70"
                r="9"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
            />

            <path
                d="M34 64 L50 50 L88 50"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>

        {/* Pino central */}
        <circle
            cx="50"
            cy="50"
            r="3.5"
            fill="var(--background)"
            stroke="var(--primary)"
            strokeWidth="2"
        />
    </svg>
);

export default function LoadingComponent() {
    return (
        <div className="flex items-center justify-center">
            <LoadingStyles />

            <div className="flex flex-col items-center">
                <ScissorsSVG />

                
            </div>
        </div>
    );
}
