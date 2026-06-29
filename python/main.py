from __future__ import annotations

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from compress_service import PRESET_SETTINGS, compress_pdf_bytes
from security_service import protect_pdf_bytes, unlock_pdf_bytes

app = FastAPI(title="pdfruk PDF service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/compress")
async def compress(
    file: UploadFile = File(...),
    preset: str = Form("medium"),
) -> Response:
    if preset not in PRESET_SETTINGS:
        raise HTTPException(status_code=400, detail="Invalid compression preset.")

    payload = await file.read()
    original_size = len(payload)

    try:
        compressed = compress_pdf_bytes(payload, preset)
    except Exception as error:
        message = str(error) or "Failed to compress PDF."
        status_code = 400 if "password-protected" in message.lower() else 422
        raise HTTPException(status_code=status_code, detail=message) from error

    filename = file.filename or "document.pdf"
    if filename.lower().endswith(".pdf"):
        filename = filename[:-4] + "-compressed.pdf"
    else:
        filename = f"{filename}-compressed.pdf"

    return Response(
        content=compressed,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Original-Size": str(original_size),
            "X-Compressed-Size": str(len(compressed)),
        },
    )


@app.post("/protect")
async def protect(
    file: UploadFile = File(...),
    password: str = Form(...),
    allowPrint: str = Form("true"),
    allowCopy: str = Form("false"),
) -> Response:
    payload = await file.read()

    try:
        protected = protect_pdf_bytes(
            payload,
            password,
            allow_print=allowPrint.lower() == "true",
            allow_copy=allowCopy.lower() == "true",
        )
    except Exception as error:
        message = str(error) or "Failed to protect PDF."
        status_code = 400
        raise HTTPException(status_code=status_code, detail=message) from error

    filename = file.filename or "document.pdf"
    if filename.lower().endswith(".pdf"):
        filename = filename[:-4] + "-protected.pdf"
    else:
        filename = f"{filename}-protected.pdf"

    return Response(
        content=protected,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.post("/unlock")
async def unlock(
    file: UploadFile = File(...),
    password: str = Form(...),
) -> Response:
    payload = await file.read()

    try:
        unlocked = unlock_pdf_bytes(payload, password)
    except Exception as error:
        message = str(error) or "Failed to unlock PDF."
        status_code = 400 if "password" in message.lower() else 422
        raise HTTPException(status_code=status_code, detail=message) from error

    filename = file.filename or "document.pdf"
    if filename.lower().endswith(".pdf"):
        filename = filename[:-4] + "-unlocked.pdf"
    else:
        filename = f"{filename}-unlocked.pdf"

    return Response(
        content=unlocked,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
