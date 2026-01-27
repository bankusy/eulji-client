import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ErrorResponse = {
    error: string;
    code?: string;
    details?: any;
};

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
    console.error("API Error Warning:", error);

    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: "Validation Error",
                code: "VALIDATION_ERROR",
                details: error.format(),
            },
            { status: 400 }
        );
    }

    if (error instanceof Error) {
        // Handle specific known errors if any
        if (error.message === "Unauthorized") {
            return NextResponse.json(
                { error: "Unauthorized", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }
        
        // Hide internal server details in production, but key message might be safe
        // For security, usually "Internal Server Error" is best unless it's a known business logic error.
        return NextResponse.json(
            { error: error.message || "Internal Server Error", code: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { error: "Unknown Error", code: "UNKNOWN_ERROR" },
        { status: 500 }
    );
}
