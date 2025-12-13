# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from ats import analyze_resume
import uvicorn

app = FastAPI(title="Simple ATS Checker")

# Allow React Native (dev) origin. For production, restrict origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ats/check")
async def check_resume(resume: UploadFile = File(...)):
    if resume.content_type not in ("application/pdf", "application/octet-stream", "application/pdf; charset=binary"):
        # Some clients send octet-stream for multipart upload — accept it
        pass

    try:
        data = await resume.read()  # bytes
        result = analyze_resume(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {e}")

@app.get("/api/ats/sample-resume")
async def download_sample_resume():
    sample_path = "SampleResume.pdf"
    return FileResponse(sample_path, media_type="application/pdf", filename="SampleResume.pdf")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

