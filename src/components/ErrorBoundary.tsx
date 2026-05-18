import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button } from "@mui/material";
import CustomError from "./ui/CustomError";

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Optional custom fallback UI.
   * If provided, this will be rendered instead of the default.
   */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // still log to console / external service
    console.error("ErrorBoundary caught:", error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    // render custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // otherwise default fallback
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        p={2}
      >
        <CustomError errorMessage="Sorry, something went wrong.">
          <Box mt={2} textAlign="center">
            <Button variant="contained" onClick={this.handleReset}>
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => (window.location.href = "/")}
              sx={{ ml: 1 }}
            >
              Go Home
            </Button>
          </Box>
        </CustomError>

        {error && (
          <details style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
            <summary style={{ cursor: "pointer" }}>Technical details</summary>
            {error.stack}
          </details>
        )}
      </Box>
    );
  }
}
