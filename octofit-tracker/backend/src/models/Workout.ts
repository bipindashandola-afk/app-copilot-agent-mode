import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: { type: String, required: [true, 'Workout title is required'] },
  focus: { type: String, required: [true, 'Workout focus is required'] },
  minutes: { type: Number, required: [true, 'Workout minutes is required'], min: [1, 'Workout minutes must be positive'] },
  difficulty: { type: String, required: [true, 'Workout difficulty is required'] },
});

export const Workout = model('Workout', workoutSchema);
