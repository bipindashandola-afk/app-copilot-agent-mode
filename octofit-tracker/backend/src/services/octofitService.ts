import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function ensureText(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${fieldName} is required`);
  }
  return value.trim();
}

function ensurePositiveMinutes(value: unknown, fieldName: string) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new HttpError(400, `${fieldName} must be a positive number`);
  }
  return numericValue;
}

function ensureObjectId(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
    throw new HttpError(400, `${fieldName} must be a valid object id`);
  }
  return new mongoose.Types.ObjectId(value);
}

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  const data = (typeof input === 'object' && input !== null ? input as Record<string, unknown> : {});
  const userId = ensureObjectId(data.userId, 'userId');
  const teamId = ensureObjectId(data.teamId, 'teamId');
  const type = ensureText(data.type, 'type');
  const minutes = ensurePositiveMinutes(data.minutes, 'minutes');

  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);

  if (!userExists) {
    throw new HttpError(404, 'User not found');
  }
  if (!teamExists) {
    throw new HttpError(404, 'Team not found');
  }

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().sort({ name: 1 }).lean();
}

export async function createTeam(input: unknown) {
  const data = (typeof input === 'object' && input !== null ? input as Record<string, unknown> : {});
  const name = ensureText(data.name, 'name');
  const mascot = ensureText(data.mascot, 'mascot');
  const rawMembers = Array.isArray(data.members) ? data.members : (data.members == null ? [] : [data.members]);
  const members = rawMembers.map((member) => ensureObjectId(member, 'member'));

  const team = await Team.create({ name, mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  if (totals.length === 0) {
    return [];
  }

  const teamIds = totals.map((entry) => entry._id);
  const teams = await Team.find({ _id: { $in: teamIds } }).select('name').lean();
  const teamNameById = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals.map((entry, index) => ({
    teamName: teamNameById.get(entry._id.toString()) ?? 'Unknown team',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = ensureText(userEmail, 'userEmail');
  const user = await User.findOne({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }).lean();

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const recentFocus = recentActivities[0]?.type ? recentActivities[0].type : user.fitnessGoal;
  const preferredFocus = typeof user.fitnessGoal === 'string' && user.fitnessGoal.trim() ? user.fitnessGoal.trim() : recentFocus;
  const workouts = await Workout.find().sort({ focus: 1, title: 1 }).lean();

  const matches = workouts.filter((workout) => workout.focus === preferredFocus);
  const fallbackMatches = workouts.filter((workout) => workout.focus === recentFocus || workout.focus === preferredFocus);
  const candidateWorkouts = matches.length > 0 ? matches : fallbackMatches.length > 0 ? fallbackMatches : workouts;

  return candidateWorkouts.slice(0, 3).map((workout) => ({
    ...workout,
    reason: `This recommendation matches your recent ${recentFocus ?? 'activity'} patterns and supports your ${preferredFocus} goal.`,
  }));
}

export { User };
