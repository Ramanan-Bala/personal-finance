import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { Express } from 'express';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { db } from '../db';
import { users } from '../db/schema';

dotenv.config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'secret', // TODO: Ensure this matches NestJS config
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, jwt_payload.sub),
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  }),
);

export const authMiddleware = passport.authenticate('jwt', { session: false });

export const setupAuth = (app: Express) => {
  app.use(passport.initialize() as any);
};
