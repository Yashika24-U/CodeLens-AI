const { where, Op } = require("sequelize");
const { ApiLog } = require("../models");

const getDashboardStats = async (req, res) => {
  try {
    const { range, modelName, conversationId } = req.query;
    const whereClause = {};

    // 1. Build the filters dynamically exactly as before

    if (modelName) whereClause.selectedModel = modelName;
    if (conversationId) whereClause.conversationId = conversationId;
    if (range === "today") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      whereClause.createdAt = { [Op.gte]: startOfMonth };
    } else if (range === "this_month") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      whereClause.createdAt = { [Op.gte]: startOfMonth };
    }

    // 2. Fetch data from DB using the whereClause (Sequelize handles empty objects perfectly!)
    const kpiMetrics = await ApiLog.findOne({
      where: whereClause,
      attributes: [],
      raw: true,
    });

    const mostRoutedModelResult = await ApiLog.findOne({
      where: whereClause,
      raw: true,
    });

    const modelBreakDown = await ApiLog.findOne({
      where: whereClause,
      raw: true,
    });

    console.log("%c⧭kpiMetrics", "color: #607339", kpiMetrics);

    return res.status(200).json({
      success: true,
      // We explicitly return "All Time" if no filter is applied so the UI can print it nicely
      activeFilters: {
        range: range || "all_time",
        userId: userId || "all_users",
        modelName: modelName || "all_models",
        conversationId: conversationId || "all_conversations",
      },
      kpis: {
        totalCostSaved: parseFloat(kpiMetrics?.totalCostSaved || 0).toFixed(2),
        avgLatencySeconds: parseFloat(
          kpiMetrics?.avgLatencySeconds || 0,
        ).toFixed(2),
        totalTokensConsumed: parseInt(kpiMetrics?.totalTokensConsumed || 0, 10),
        mostRoutedModel: mostRoutedModelResult
          ? mostRoutedModelResult.selectedModel
          : "N/A",
      },
      tableData: modelBreakdown.map((row) => ({
        /* ... formatting mapping rules ... */
      })),
    });
  } catch (error) {
    console.log("Analytics extraction error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error compiling dashboard stats" });
  }
};
