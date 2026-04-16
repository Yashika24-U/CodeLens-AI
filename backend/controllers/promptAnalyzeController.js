const aiService = require("../services/promptService");

export const analyzePrompts = async (req, res) => {
  try {
    const result = await aiService.generate(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
