// model/Review.js
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      review_feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tech_stack: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED"),
        defaultValue: "PENDING",
      },
      depth: {
        type: DataTypes.ENUM("BEGINNER", "INTERMEDIATE", "EXPERT"),
        defaultValue: "BEGINNER",
      },
      score: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
          max: 100,
        },
      },

      model_used: {
        type: DataTypes.STRING(50),
        defaultValue: "gemini-1.5-flash",
      },
    },
    {
      timestamps: true, // Enables created_at and updated_at automatically
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "reviews",
    },
  );
  return Review;
};
