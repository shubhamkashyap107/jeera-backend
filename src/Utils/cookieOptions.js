// Frontend and backend live on different domains in production, so the auth
// cookie must be SameSite=None + Secure there. Over plain http (local dev)
// browsers reject that combo, so fall back to Lax.
// req.secure is reliable behind Render's proxy because app.js sets "trust proxy".
const cookieOptions = (req) => {
    const secure = req.secure

    return {
        httpOnly : true,
        secure,
        sameSite : secure ? "none" : "lax"
    }
}

module.exports = {
    cookieOptions
}
