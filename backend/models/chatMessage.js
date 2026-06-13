module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define(
    "ChatMessage",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUID4,
        primaryKey: true,
      },
      conversationId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Group individual message string into a unified chat session",
      },
      sender: {
        type: DataTypes.ENUM("user", "model"),
        allowNull: false,
        comment:
          "Identifies whether the prompt came from the engineer or the routed AI",
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "The raw text snippet, log file, or code payload",
      },
    },
    {
      tableName: "chat_messages",
      timestamps: true,
      underscored: true,
    },
  );
  return ChatMessage;
};
