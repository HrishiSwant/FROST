from fastapi.responses import JSONResponse


def success_response(data=None, message="Success", status_code=200):
    """
    Standard success response used across the application.
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data
        }
    )


def error_response(message="Something went wrong", status_code=400, errors=None):
    """
    Standard error response used across the application.
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "errors": errors
        }
    )
