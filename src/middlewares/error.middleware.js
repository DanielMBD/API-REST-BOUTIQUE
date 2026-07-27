function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Une ressource avec cette valeur existe déjà"
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors).map((item) => item.message).join(", ")
    });
  }

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Erreur interne du serveur"
  });
}

module.exports = { notFound, errorHandler };
