import { Request, Response, NextFunction } from 'express';

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve()
      .then(() => fn(req, res, next))
      .catch(next);
  };

export default asyncHandler;
