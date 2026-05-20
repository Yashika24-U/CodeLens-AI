const { DataTypes } = require("sequelize");
const { underscoredIf } = require("sequelize/lib/utils");

module.exports = (sequelize, DataTypes) => {
  const ApiLog = sequelize.define(
    "ApiLog",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      conversationId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "conversation_id",
      },
      selectedModel: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "selected_model",
      },
      promptTokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "prompt_tokens",
      },
      completionTokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "completion_tokens",
      },
      latencyMs: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "latency_ms",
      },
      calculatedCost: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        field: "calculated_cost",
      },
      estimatedO1_cost: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        field: "estimated_o1_cost",
      },
    },
    {
      timestamps: true,
      tableName: "api_logs",
      underscored: true,
    },
  );

  // If you want to associate this with a User or Conversation model later, you can add it here:
  ApiLog.associate = (models) => {
    ApiLog.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };
  return ApiLog;
};
