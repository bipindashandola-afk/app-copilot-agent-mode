import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: [true, 'User name is required'] },
  email: { type: String, required: [true, 'User email is required'] },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  fitnessGoal: { type: String, required: [true, 'User fitness goal is required'] },
});

export const User = model('User', userSchema);
